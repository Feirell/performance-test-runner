import {defaultTestRunner, measure, speed} from "../src/performance-test-runner";
import {printSuiteState} from "../src/suite-console-printer";

measure('object manipulation', () => {
    speed('delete', () => {
        // This is the setup block
        var obj = {
            attr: 12
        }
    }, () => {
        // This is the actual test
        var obj; // just to make your IDE / TypeScript know that obj is present

        throw new Error('This is a error');

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

(async () => {
    const firstLogger = printSuiteState(defaultTestRunner, {printOnCycle: true, framerate: 30});
    await defaultTestRunner.runSuite();
    await firstLogger;
})()
    .catch(err => {
        let actualError = err;
        if (err.type == 'error')
            actualError = err.message;

        console.error(actualError);
        process.exit(1);
    })
