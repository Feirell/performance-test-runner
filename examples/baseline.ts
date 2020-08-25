import {baselineBundleBasic} from "../src/baseline";
import {printSuiteState} from "../src/suite-console-printer";
import {defaultTestRunner} from "../src/performance-test-runner";

baselineBundleBasic();

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
