# performance-test-runner

<!-- USEFILE: examples\example-tests.ts; str => str.replace(/\.\.\//g, 'performance-test-runner/') -->
``` ts
import {defaultTestSuite, measure, speed} from "performance-test-runner/src/performance-test-suite";
import {printSuiteState} from "performance-test-runner/src/suite-console-printer";
import {baselineBundleBasic} from "performance-test-runner/src/baseline";

measure('object manipulation', () => {
    speed('delete', () => {
        // This is the setup block
        var obj = {
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

    (global).require = require;

    speed('with external', () => {
        // you need to (re-)import your code in the setup block if you need a setup block
        var realExtensiveFnc = require('./some-script').default;

        import('./some-script'); // this will only be needed if you want TypeScript to realise that you are using some-script.ts
    }, () => {
        var realExtensiveFnc; // redeclaring to help out your IDE / TypeScript

        realExtensiveFnc();
    })
});

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

baselineBundleBasic();

(async () => {
    const firstLogger = printSuiteState(defaultTestSuite, {printOnCycle: true, framerate: 30});
    await defaultTestSuite.runSuite();
    await firstLogger;
})()
    .catch(err => {
        const errMsg = 'message' in err ? err.message : err;
        console.error('encountered an error while running example tests\n' + errMsg);
        process.exit(1);
    })



```
*You can find this in `examples\example-tests.ts`*
