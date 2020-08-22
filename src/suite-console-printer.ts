import {ReplacePrinter} from "replace-printer";

import {PerformanceTestSuite} from "./performance-test-suite";
import {formatResultTable} from "./stringify-result-table";
import {createThrottle} from "./throttle";

let otherIsRunning = false;

export function printSuiteState(suite: PerformanceTestSuite, {
    printOnCycle = false,
    framerate = 30
} = {}) {
    return new Promise((res, rej) => {
        if (otherIsRunning)
            throw new Error('another suite is being printed at the moment');

        // deactivating the timeout since the output should be printed immediately
        const {continuesConsole, replaceConsole} = new ReplacePrinter({throttleTimeout: 0});

        let frameTime = 1000 / 30;

        if (!Number.isFinite(framerate))
            frameTime = 1000 / frameTime;
        else if (framerate < 1)
            frameTime = 1000;
        else if (framerate == Infinity)
            frameTime = 0;
        else
            frameTime = 1000 / framerate;

        // TODO remove isLast and let update accept arguments
        let isLast = false;
        const update = createThrottle(() => {
            replaceConsole.log(formatResultTable(suite.extractTestResults()) + (isLast ? '\n' : ''))
        }, frameTime);

        suite.on('suite-started', () => {
            otherIsRunning = true;
            update();
        });

        if (printOnCycle)
            suite.on('benchmark-cycle', () => {
                update();
            });

        suite.on('benchmark-finished', () => {
            update();
        });

        suite.on('suite-finished', () => {
            isLast = true;
            update(true)
                .then(() => res());
        });

        suite.on('suite-error', ({eventData}) => {
            isLast = true;
            update(true)
                .then(() => rej(eventData));
        });
    }).finally(() => {
        otherIsRunning = false
    });
}