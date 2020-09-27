import {ReplacePrinter} from "replace-printer";

import {defaultTestRunner, PerformanceTestRunner} from "./performance-test-runner";
import {formatResultTable} from "./stringify-result-table";
import {createThrottle} from "./throttle";

let otherIsRunning = false;

const calcFrameTime = (framerate: any, defaultFrameRate = 30) => {
    let frameTime;

    if (!Number.isFinite(framerate))
        frameTime = 1000 / defaultFrameRate;
    else if (framerate < 1)
        frameTime = 1000;
    else if (framerate == Infinity)
        frameTime = 0;
    else
        frameTime = 1000 / framerate;

    return frameTime;
}

export function printSuiteState(suite: PerformanceTestRunner, {
    printOnCycle = true,
    framerate = 30
} = {}, rp = new ReplacePrinter()) {
    let {
        continuesConsole: cc,
        replaceConsole: rc
    } = rp;

    let update;

    return new Promise((res, rej) => {
        if (otherIsRunning)
            throw new Error('another suite is being printed at the moment');

        const logState = () =>
            rc.log(formatResultTable(suite.extractTestResults()));

        update = createThrottle(logState, calcFrameTime(framerate));

        suite.addListener('suite-started', () => update());

        suite.addListener('benchmark-started', () => update());

        if (printOnCycle)
            suite.addListener('benchmark-cycle', () => update());

        suite.addListener('benchmark-error', (err) => (update(), cc.error(err)));

        suite.addListener('benchmark-finished', () => update());

        suite.addListener('suite-error', ({eventData: error}) => {
            cc.error(error);
            update(true)
                .then(() => rej(error));
        });

        suite.addListener('suite-finished', () => {
            update(true)
                .then(() => res());
        });
    }).finally(() => {
        // TODO create better way to stop all listeners from printing
        rc = cc = null;
        update = () => Promise.resolve();

        otherIsRunning = false
    });
}

export function runAndReport(pts = defaultTestRunner, sp = new ReplacePrinter()) {
    return (async () => {
        const logger = printSuiteState(pts, {printOnCycle: true, framerate: 30});
        await pts.runSuite();
        await logger;
    })()
        .catch(err => {
            let actualError = err;
            if (err.type == 'error')
                actualError = err.message;

            console.error(actualError);
            process.exit(1);
        });
}