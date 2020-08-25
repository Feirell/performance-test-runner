import {ReplacePrinter} from "replace-printer";

import {defaultTestSuite, PerformanceTestSuite} from "./performance-test-suite";
import {formatResultTable} from "./stringify-result-table";
import {createThrottle} from "./throttle";

let otherIsRunning = false;

export function printSuiteState(suite: PerformanceTestSuite, {
    printOnCycle = true,
    framerate = 30
} = {}, {
                                    continuesConsole: cc,
                                    replaceConsole: rc
                                } = new ReplacePrinter()) {
    return new Promise((res, rej) => {
        if (otherIsRunning)
            throw new Error('another suite is being printed at the moment');

        let frameTime = 1000 / 30;

        if (!Number.isFinite(framerate))
            frameTime = 1000 / frameTime;
        else if (framerate < 1)
            frameTime = 1000;
        else if (framerate == Infinity)
            frameTime = 0;
        else
            frameTime = 1000 / framerate;

        const logState = () =>
            rc.log(formatResultTable(defaultTestSuite.extractTestResults()));

        const update = createThrottle(logState, frameTime);

        defaultTestSuite.addListener('suite-started', () => update());

        defaultTestSuite.addListener('benchmark-started', () => update());

        if (printOnCycle)
            defaultTestSuite.addListener('benchmark-cycle', () => update());

        defaultTestSuite.addListener('benchmark-error', (err) => (update(), cc.error(err)));

        defaultTestSuite.addListener('benchmark-finished', () => update());

        const closeWithEOL = () =>
            process.stdout.write('\n')

        // TODO try to resolve the bug with multiple suites (and suite console printers) which have line breaking issues
        // so that the closeWithEOL is not needed anymore

        defaultTestSuite.addListener('suite-error', ({eventData: error}) => {
            cc.error(error);
            update(true)
                .then(() => (closeWithEOL(), rej(error)));
        });

        defaultTestSuite.addListener('suite-finished', () => {
            update(true)
                .then(() => (closeWithEOL(), res()));
        });
    }).finally(() => {
        otherIsRunning = false
    });
}