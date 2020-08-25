import 'test-for-feature-a';
import 'test-for-feature-b';
import 'test-for-feature-c';

import {defaultTestRunner} from '../src/performance-test-runner';

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
    })