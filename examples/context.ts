import {defaultTestRunner, measure, speed} from "../src/performance-test-runner";
import {runAndReport} from "../src/suite-console-printer";

import {performance} from "perf_hooks";

// When you have a type checker or other transpilers in place you can include something like this to ignore type errors
// that variables does not exist on the global object
let global: any;
let window: any;

measure('timestamp', () => {
    // if you want to use something which is in the closure (not in the scope of the test function) you need to
    // add them in the context object, which is the second parameter. The reason is the nature of the benchmark package
    // which joins the setup, testFn and teardown by concatenating the body (as strings) and recompiling the function.
    // This results in the loss of the context which prevents you from using closures.

    // This context can either be addressed directly by the identifier 'global' or 'window' (which is shadowed by the
    // benchmark package) or by the unrolled keys (the identifier directly).
    speed('performance.now', {perf : performance}, () => {
        // You can either use window.perf, global.perf or perf directly. But the last option will provoke warnings and
        // transpile errors. I would recommend using the global.XX variant.

        global.perf.now();
    });

    speed('Date.now', () => {
        // You do not need to add Date object to the context, since it is part of the actual global.
        Date.now();
    });
});

measure('copy array', () => {
    const arrayDefinition = new Array(200).fill(0);
    delete arrayDefinition[100];

    // Since the context is just a object you can also go ahead and rename you identifier.
    speed('slice', {arr: arrayDefinition}, () => {
        global.arr.slice();
    });

    speed('array of', {arrayDefinition}, () => {
        // can just use the name, since the transpiler is not aware of the context loss
        Array.from(arrayDefinition);
    });

    speed('spread', {arr: arrayDefinition}, () => {
        [...window.arr];
    });
});

runAndReport(defaultTestRunner);