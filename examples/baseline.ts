import {defaultTestRunner, measure, speed} from "../src/performance-test-runner";
import {runAndReport} from "../src/suite-console-printer";

import {baselineBundleBasic} from "../src/baseline";

import {performance} from "perf_hooks";

measure('timestamp', () => {
    speed('performance.now', {performance}, () => {
        global.performance.now();
    });

    speed('Date.now', () => {
        Date.now();
    });
});

baselineBundleBasic();

runAndReport(defaultTestRunner);