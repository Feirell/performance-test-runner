import {EventEmitter} from 'events';
import * as Benchmark from 'Benchmark';

import {depthFirst, depthFirstAsync, mapDepthFirst} from "./tree-walker";
import {formatResultTable, PossibleTableFormatterTypes} from "./stringify-result-table";

interface SpeedAndMeasure<T extends 'speed' | 'measure'> {
    type: T;
    title: string;
}

interface SpeedTest extends SpeedAndMeasure<'speed'> {
    title: string;
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
    suite: PerformanceTestSuite;
    eventData: K;
}

export interface BenchmarkEvent<K extends object = any> extends SuiteEvent<K> {
    benchmark: Benchmark;
    associatedGroup: Readonly<MeasureGroup>;
    associatedTest: Readonly<SpeedTest>;
}

// MEASUREMENT RESULTS

interface SpeedTestResult {
    type: 'header' | 'measurements',
    name: string,
}

interface SPTRMeasurement extends SpeedTestResult {
    type: 'measurements',
    state: 'initialized' | 'running' | 'finished';
}

interface SPTRMeasurementInitialized extends SPTRMeasurement {
    type: 'measurements',
    state: 'initialized';
    name: string,
}

interface SPTRMeasurementsRunningFinished extends SPTRMeasurement {
    type: 'measurements',
    state: 'running' | 'finished';
    hz: number;
    rme: number;
    samples: number;
}

interface SPTRGroup extends SpeedTestResult {
    type: 'header',
    containing: (SPTRGroup | SPTRMeasurementInitialized | SPTRMeasurementsRunningFinished)[]
}

export class PerformanceTestSuite extends EventEmitter {
    suiteRunning = false;
    runnedTestAlready = false;
    private callStack: MeasureGroup[] = [];
    private testTree: MeasureGroup[] = [];

    constructor(runTestsOnExit = false) {
        super();
        // to ensure that the extracted functions keep their context
        this.measure = this.measure.bind(this);
        this.speed = this.speed.bind(this);
    }

    measure(title: string, fnc: () => any) {
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

    speed(title: string, test: () => any);
    speed(title: string, setup: () => any, test: () => any);
    speed(title: string, setup: () => any, test: () => any, teardown: () => {});

    speed(title: string, ...functions: (() => any)[]) {
        if (functions.length < 1)
            throw new Error('at least the test function needs to be defined');

        if (functions.length > 3)
            throw new Error('too many functions given, can only use setup, test and teardown');

        if (functions.length == 1)
            functions = [noop, functions[0], noop];

        else if (functions.length == 2)
            functions = [functions[0], functions[1], noop];

        const [setup, test, teardown] = functions;

        const currentTest: SpeedTest = {
            type: "speed",
            title, setup, test, teardown,
            benchmark: undefined
        };

        this.callStack[this.callStack.length - 1]
            .containing.push(currentTest);
    }

    public extractTestResults() {
        return mapDepthFirst<SpeedTest, MeasureGroup, SPTRMeasurementInitialized | SPTRMeasurementsRunningFinished, SPTRGroup>(this.testTree, (elem): PossibleTableFormatterTypes => {
            if (elem.type == 'measure') {
                return {type: 'header', name: elem.title, containing: []};
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
        });
    }

    public stringifySuite() {
        return formatResultTable(this.extractTestResults());
    }

    async runSuite({
                       clearPreviousResults = true
                   } = {}) {
        if (this.testTree.length == 0)
            return false;

        if (this.suiteRunning)
            return false;

        if (clearPreviousResults) {
            depthFirst<SpeedTest, MeasureGroup>(this.testTree, (elem, parent) => {
                if (elem.type == 'measure')
                    return;

                elem.benchmark = undefined;
            })
        }

        this.suiteRunning = true;

        this.emit('suite-started', {
            timestamp: Date.now(),
            type: 'suite-started',
            suite: this,
            eventData: undefined
        } as SuiteEvent);

        try {
            await depthFirstAsync<SpeedTest, MeasureGroup>(this.testTree, async (elem, parent) => {
                if (elem.type == 'measure')
                    return;

                const {setup, test: fn, teardown} = elem;

                let bench: Benchmark;

                const onCycle = (arg: any) => this.emit('benchmark-cycle', {
                    timestamp: Date.now(),
                    type: 'benchmark-cycle',
                    suite: this,
                    associatedGroup: parent as MeasureGroup,
                    benchmark: bench,
                    associatedTest: elem,
                    eventData: arg
                } as BenchmarkEvent);

                const benchPromise = new Promise((res, rej) => {
                    bench = new Benchmark({
                        setup, fn, teardown, async: true,
                        onError: rej,
                        onComplete: res,
                        onCycle,
                    });
                });

                elem.benchmark = bench;
                bench.run();

                this.emit('benchmark-started', {
                    timestamp: Date.now(),
                    type: 'benchmark-started',
                    suite: this,
                    associatedGroup: parent as MeasureGroup,
                    benchmark: bench,
                    associatedTest: elem,
                    eventData: undefined
                } as BenchmarkEvent);

                try {
                    await benchPromise;
                } catch (err) {
                    this.suiteRunning = false;

                    this.emit('benchmark-error', {
                        timestamp: Date.now(),
                        type: 'benchmark-error',
                        suite: this,
                        associatedGroup: parent as MeasureGroup,
                        benchmark: bench,
                        associatedTest: elem,
                        eventData: err
                    } as BenchmarkEvent)

                    throw err;
                }
                this.emit('benchmark-finished', {
                    timestamp: Date.now(),
                    type: 'benchmark-finished',
                    suite: this,
                    associatedGroup: parent as MeasureGroup,
                    benchmark: bench,
                    associatedTest: elem,
                    eventData: undefined
                } as BenchmarkEvent);
            });
        } catch (err) {
            this.emit('suite-error', {
                timestamp: Date.now(),
                type: 'suite-error',
                suite: this,
                eventData: err
            } as SuiteEvent);

            throw err;
        }

        this.suiteRunning = false;
        this.emit('suite-finished', {
            timestamp: Date.now(),
            type: 'suite-finished',
            suite: this,
            eventData: undefined
        } as SuiteEvent);

        return true;
    }
}

export const defaultTestSuite = new PerformanceTestSuite(true);

export const measure = defaultTestSuite.measure;
export const speed = defaultTestSuite.speed;