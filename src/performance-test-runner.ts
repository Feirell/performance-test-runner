import {EventEmitter} from 'events';
import * as Benchmark from 'Benchmark';

import {depthFirst, depthFirstAsync, mapDepthFirst} from "./tree-walker";
import {extractFunctionBodyString} from "./function-body-helper";

type AnyObject = { [key: string]: any }

interface SpeedAndMeasure<T extends 'speed' | 'measure'> {
    type: T;
    title: string;
}

interface SpeedTest extends SpeedAndMeasure<'speed'> {
    title: string;
    ctx: AnyObject
    setup: () => any;
    test: () => any;
    teardown: () => any;
    benchmark: Benchmark | undefined;
}

interface MeasureGroup extends SpeedAndMeasure<'measure'> {
    title: string;
    containing: (SpeedTest | MeasureGroup)[];
}

const noop = () => {
};

export interface SuiteEvent<K extends object = any> {
    timestamp: number;
    type: string,
    suite: PerformanceTestRunner;
    eventData: K;
}

export interface BenchmarkEvent<K extends object = any> extends SuiteEvent<K> {
    benchmark: Benchmark;
    associatedGroup: Readonly<MeasureGroup>;
    associatedTest: Readonly<SpeedTest>;
}

// MEASUREMENT RESULTS

interface SpeedTestResult {
    type: 'group' | 'measurements',
    name: string,
}

interface SPTRMeasurement extends SpeedTestResult {
    type: 'measurements',
    state: 'initialized' | 'running' | 'finished';
}

export interface SPTRMeasurementInitialized extends SPTRMeasurement {
    type: 'measurements',
    state: 'initialized';
    name: string,
}

export interface SPTRMeasurementsRunningFinished extends SPTRMeasurement {
    type: 'measurements',
    state: 'running' | 'finished';
    hz: number;
    rme: number;
    samples: number;
}

export interface SPTRGroup extends SpeedTestResult {
    type: 'group',
    containing: (SPTRGroup | SPTRMeasurementInitialized | SPTRMeasurementsRunningFinished)[]
}

export type AllSPTRTypes =
    SPTRMeasurementInitialized |
    SPTRMeasurementsRunningFinished |
    SPTRGroup;

const orderFunctions = (functions: (() => any)[]) => {
    if (functions.length < 1)
        throw new Error('at least the test function needs to be defined');

    if (functions.length > 3)
        throw new Error('too many functions given, can only use setup, test and teardown');

    if (functions.length == 1)
        return [noop, functions[0], noop];

    else if (functions.length == 2)
        return [functions[0], functions[1], noop];

    return functions;
}

const isValidIdentifier = (id: string) => {
    if (/[ ;\n]/.test(id))
        return false;

    try {
        return Function('var ' + id + ' = 0; return ' + id + ';')() == 0
    } catch (e) {
        return false;
    }
}

export class PerformanceTestRunner extends EventEmitter {
    private suiteRunning = false;

    private callStack: MeasureGroup[] = [];
    private testTree: MeasureGroup[] = [];

    constructor() {
        super();

        // to ensure that the extracted functions keep their context
        this.measure = this.measure.bind(this);
        this.speed = this.speed.bind(this);
    }

    public measure(title: string, fnc: () => any) {
        const currentMeasure: MeasureGroup = {
            type: "measure",
            title, containing: []
        };

        if (this.callStack.length == 0)
            this.testTree.push(currentMeasure);
        else {
            this.callStack[this.callStack.length - 1]
                .containing.push(currentMeasure);
        }

        this.callStack.push(currentMeasure);

        fnc();

        this.callStack.pop();
    }

    public speed(title: string, test: () => any);
    public speed(title: string, context: AnyObject, test: () => any);

    public speed(title: string, setup: () => any, test: () => any);
    public speed(title: string, context: AnyObject, setup: () => any, test: () => any);

    public speed(title: string, setup: () => any, test: () => any, teardown: () => any);
    public speed(title: string, context: AnyObject, setup: () => any, test: () => any, teardown: () => any);

    public speed(title: string, firstFncOrContext: AnyObject | (() => any), ...functions: (() => any)[]) {
        let ctx = {} as AnyObject;

        if (typeof firstFncOrContext == 'function')
            functions.unshift(firstFncOrContext as () => any);
        else
            ctx = firstFncOrContext;

        const [setup, test, teardown] = orderFunctions(functions);

        const currentTest: SpeedTest = {
            type: "speed",
            title, ctx, setup, test, teardown,
            benchmark: undefined
        };

        this.callStack[this.callStack.length - 1]
            .containing.push(currentTest);
    }

    public extractTestResults() {
        return mapDepthFirst<SpeedTest, MeasureGroup, SPTRMeasurementInitialized | SPTRMeasurementsRunningFinished, SPTRGroup>(this.testTree, (elem): AllSPTRTypes => {
            if (elem.type == 'measure') {
                return {type: 'group', name: elem.title, containing: []};
            } else {
                const bench = elem.benchmark;

                const state =
                    !bench || bench.stats.sample.length == 0 ? 'initialized' :
                        bench.running ? 'running' :
                            'finished';

                if (state == 'initialized') {
                    return {
                        type: 'measurements',
                        name: elem.title, state
                    };
                } else {
                    const stats = bench.stats;

                    return {
                        type: 'measurements',
                        name: elem.title, state,

                        hz: bench.hz,
                        rme: stats.rme,
                        samples: stats.sample.length
                    };
                }
            }
        }) as unknown as SPTRGroup[]; // first level of the array will always only contain SPTRGroups
    }

    public clearResults() {
        if (this.suiteRunning)
            return false;

        depthFirst<SpeedTest, MeasureGroup>(this.testTree, (elem, parent) => {
            if (elem.type == 'measure')
                return;

            elem.benchmark = undefined;
        });

        return true;
    }

    async runSuite({clearPreviousResults = true} = {}) {
        if (this.testTree.length == 0)
            return false;

        if (this.suiteRunning)
            return false;

        if (clearPreviousResults)
            this.clearResults();

        this.suiteRunning = true;

        this.emitSuiteEvent('suite-started');

        try {
            await depthFirstAsync<SpeedTest, MeasureGroup>(this.testTree, async (elem, parent) => {
                if (elem.type == 'measure')
                    return;

                const {ctx, setup, test: fn, teardown} = elem;

                let bench: Benchmark;

                const benchPromise = new Promise((res, rej) => {
                    const ContextInjectedBench = (Benchmark as any).runInContext(ctx) as typeof Benchmark

                    // derolling the context object from the "global" to allow users use attributes of the context without
                    // prepending "global."

                    // Warning: this will not work with transpilers like tsc since they create new identifier in the process

                    const contextUnrolled = Object.keys(ctx)
                        // remove keys which are not valid identifier
                        .filter(isValidIdentifier)
                        .map(k => 'let ' + k + ' = global.' + k + ';').join('\n') + '\n';

                    // extracting the body, since it is not clear when the benchmark package compiles the function and when not
                    // this ensures that all tests run in the same manner and ensure that a given context can be used
                    // by the test function

                    const setupBody = extractFunctionBodyString(setup);
                    const fnBody = extractFunctionBodyString(fn);
                    const teardownBody = extractFunctionBodyString(teardown);

                    const onCycle = (ev: any) => this.emitBenchmarkEvent('benchmark-cycle', parent, elem, bench, ev);

                    bench = new ContextInjectedBench({
                        setup: contextUnrolled + setupBody,
                        fn: fnBody,
                        teardown: teardownBody,

                        async: true,

                        onError: rej,
                        onComplete: res,
                        onCycle
                    });
                });

                elem.benchmark = bench;
                bench.run();

                this.emitBenchmarkEvent('benchmark-started', parent, elem, bench);

                try {
                    await benchPromise;
                } catch (err) {
                    this.suiteRunning = false;
                    this.emitBenchmarkEvent('benchmark-error', parent, elem, bench, err);

                    throw err;
                }

                this.emitBenchmarkEvent('benchmark-finished', parent, elem, bench);
            });
        } catch (err) {
            this.suiteRunning = false;
            this.emitSuiteEvent('suite-error', err);
            throw err;
        }

        this.suiteRunning = false;
        this.emitSuiteEvent('suite-finished');

        return true;
    }

    private emitSuiteEvent(ev: 'suite-started' | 'suite-error' | 'suite-finished', eventData: any = undefined) {
        this.emit(ev, {
            type: ev,
            timestamp: Date.now(),
            suite: this,
            eventData
        } as SuiteEvent);
    }

    private emitBenchmarkEvent(ev: 'benchmark-started' | 'benchmark-cycle' | 'benchmark-error' | 'benchmark-finished',
                               ag: MeasureGroup, at: SpeedTest, bench: Benchmark, eventData: any = undefined) {
        this.emit(ev, {
            type: ev,
            timestamp: Date.now(),
            suite: this,
            associatedGroup: ag,
            associatedTest: at,
            benchmark: bench,
            eventData: eventData
        } as BenchmarkEvent);
    }


}

export const defaultTestRunner = new PerformanceTestRunner();

export const measure = defaultTestRunner.measure;
export const speed = defaultTestRunner.speed;