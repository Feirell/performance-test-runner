// const process = require('process');

import * as process from 'process';

export class PerformanceTestGroup {

    private subGroups: PerformanceTestGroup[] = [];
    private collectionGroups = false;

    constructor(title: string, fnc: () => any) {
    }

    async testAllGroups(continues = true) {

        // let timeoutID;
        // if (continues)
        //     timeoutID = setInterval(() => {
        //         TestGroup.logAllSuites();
        //     }, 75);

        // for (const testGroup of TestGroup.getAllGroups())
        // testGroup.createSuite();

        // for (const testGroup of TestGroup.getAllGroups())
        // await testGroup.runSuite();

        // if (continues)
        //     clearInterval(timeoutID);
        // TestGroup.logAllSuites();
    }

    async run() {

    }
}

interface SpeedAndMeasure<T extends 'speed' | 'measure'> {
    type: T;
    title: string;
}

interface SpeedTest extends SpeedAndMeasure<'speed'> {
    title: string;
    test: () => any;
}

interface MeasureGroup extends SpeedAndMeasure<'measure'> {
    title: string;
    containing: SpeedAndMeasure<'speed' | 'measure'>[];
}

export class PerformanceTestSuite {
    private callStack: MeasureGroup[] = [];
    private testTree: MeasureGroup[] = [];

    constructor(runTestsOnExit = true) {
        // to ensure that the extracted functions keep their context
        this.measure = this.measure.bind(this);
        this.speed = this.speed.bind(this);

        if (runTestsOnExit)
            process.on('beforeExit', () => {
                this.runSuite()
                    .catch(err => {
                        console.error(err);
                        process.exit(1);
                    });
            })
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

    speed(title: string, fnc: () => any) {
        if (this.callStack.length == 0)
            throw new Error('speed needs to be surrounded by a measure call');

        const currentTest: SpeedTest = {
            type: "speed",
            title, test: fnc
        };

        this.callStack[this.callStack.length - 1]
            .containing.push(currentTest);
    }

    async runSuite() {
        if (this.testTree.length == 0)
            return false;

        return true;
    }
}

export const defaultTestSuite = new PerformanceTestSuite();

export const measure = defaultTestSuite.measure;
export const speed = defaultTestSuite.speed;