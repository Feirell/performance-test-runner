import {defaultTestRunner, measure, speed} from "../src/performance-test-runner";
import {performance} from "perf_hooks";

measure('timestamp', () => {
    speed('performance.now', () => {
        performance.now();
    });

    speed('Date.now', () => {
        Date.now();
    });
});

(async () => {
    await defaultTestRunner.runSuite();
    console.log(defaultTestRunner.extractTestResults());
})()
    .catch(err => {
        let actualError = err;
        if (err.type == 'error')
            actualError = err.message;

        console.error(actualError);
        process.exit(1);
    });