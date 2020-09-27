import {defaultTestRunner, measure, speed} from "../src/performance-test-runner";
import {runAndReport} from "../src/suite-console-printer";

import {performance} from "perf_hooks";

let global: any;

measure('timestamp', () => {
    speed('performance.now', {performance}, () => {
        global.performance.now();
    });

    speed('Date.now', () => {
        Date.now();
    });
});

runAndReport(defaultTestRunner);