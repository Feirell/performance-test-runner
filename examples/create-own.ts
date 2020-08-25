import {PerformanceTestRunner} from "../src/performance-test-runner";
import {performance} from "perf_hooks";

const ptr = new PerformanceTestRunner();
const {measure, speed} = ptr;

measure('timestamp', () => {
    speed('performance.now', () => {
        performance.now();
    });

    speed('Date.now', () => {
        Date.now();
    });
});

(async () => {
    await ptr.runSuite();
    console.log(ptr.extractTestResults());
})()
    .catch(err => {
        let actualError = err;
        if (err.type == 'error')
            actualError = err.message;

        console.error(actualError);
        process.exit(1);
    })