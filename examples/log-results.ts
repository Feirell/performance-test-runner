import {defaultTestRunner, measure, speed} from "../src/performance-test-runner";
import {printSuiteState, runAndReport} from "../src/suite-console-printer";

import {formatResultTable} from "../src/stringify-result-table";

let global: any;

measure('copy array', () => {
    const arr = new Array(200).fill(0);
    delete arr[100];

    speed('slice', {arr}, () => {
        arr.slice();
    });

    speed('array of', {arr}, () => {
        Array.from(arr); // can not handle empty slots (EMPTY => undefined)
    });

    speed('spread', {arr}, () => {
        [...arr]; // can not handle empty slots (EMPTY => undefined)
    });
});

// you can either call the this helper:

// runAndReport(defaultTestRunner);

// or you can construct the output logger yourself and customize it
(async () => {
    // this function will attach the listeners on the PerformanceTestRunner and log its state on change in place (to see
    // the results live)
    const logger = printSuiteState(defaultTestRunner, {printOnCycle: true, framerate: 30});

    // running the suite
    await defaultTestRunner.runSuite();

    // you only need to await the logger if you want to print something else after the performance test run
    await logger;

    // this will format it in the same way as the logger does
    const formattedResult = formatResultTable(defaultTestRunner.extractTestResults());
})()
    .catch(err => {
        let actualError = err;
        if (err.type == 'error')
            actualError = err.message;

        console.error(actualError);
        process.exit(1);
    });