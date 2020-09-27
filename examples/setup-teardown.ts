import {defaultTestRunner, measure, speed} from "../src/performance-test-runner";
import {runAndReport} from "../src/suite-console-printer";

import {Example} from "./some-script";

measure('object manipulation', () => {
    speed('delete', () => {
        // This is the setup block
        let obj = {
            attr: 12
        }
    }, () => {
        // This is the actual test
        var obj; // just to make your IDE / TypeScript know that obj is present

        delete obj.attr;
    }, () => {
        // This is the teardown
        var obj; // just to make your IDE / TypeScript know that obj is present

        obj = undefined;
    });

    speed('with external', {Example}, () => {
        const instance = new Example();
    }, () => {
        var instance; // redeclaring to help out your IDE / TypeScript

        instance.run();
    })
});

runAndReport(defaultTestRunner);