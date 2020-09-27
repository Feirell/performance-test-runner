import {PerformanceTestRunner} from "../src/performance-test-runner";
import {runAndReport} from "../src/suite-console-printer";

import {performance} from "perf_hooks";

const ptr = new PerformanceTestRunner();
const {measure, speed} = ptr;

measure('timestamp', () => {

    speed('performance.now', {performance}, () => {
        global.performance.now();
    });

    speed('Date.now', () => {
        Date.now();
    });
});

runAndReport(ptr);