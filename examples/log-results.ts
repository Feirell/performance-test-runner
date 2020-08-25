import {defaultTestRunner, measure, speed} from "../src/performance-test-runner";
import {printSuiteState} from "../src/suite-console-printer";
import {formatResultTable} from "../src/stringify-result-table";

measure('copy array', () => {
    const arr = new Array(200).fill(0);
    delete arr[100];

    speed('slice', () => {
        arr.slice();
    });

    speed('array of', () => {
        Array.from(arr); // can not handle empty slots (EMPTY => undefined)
    });

    speed('spread', () => {
        [...arr]; // can not handle empty slots (EMPTY => undefined)
    });
});

(async () => {
    const logger = printSuiteState(defaultTestRunner);
    await defaultTestRunner.runSuite();

    // you only need to await the logger if you want to print something else after the performance test run
    await logger;

    // this will format it in the same way as
    const formattedResult = formatResultTable(defaultTestRunner.extractTestResults());
})()
    .catch(err => {
        let actualError = err;
        if (err.type == 'error')
            actualError = err.message;

        console.error(actualError);
        process.exit(1);
    })


