# performance-test-runner

This package is meant to help you define benchmarks for the [benchmark package](https://www.npmjs.com/package/benchmark) in a similar way as you can define unit tests with karma etc.

This package exposes one main class `PerformanceTestRunner` which has two central methods `measure` and `speed` which you can use to construct a test graph like you can do with `describe` and `it` for unit testing.

For example if you wanted to test whether `performance.now` or `Date.now` is faster you could create you benchmarks like this.

<!-- USEFILE: examples\simple-tests.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->
``` ts
import {defaultTestRunner, measure, speed} from "performance-test-runner";
import {runAndReport} from "performance-test-runner/lib/suite-console-printer";

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
```
*You can find this in `examples\simple-tests.ts`*

Those test would result in output similar to the following.

```text
                      ops/sec  MoE samples relative
timestamp
  performance.now 10,090,797 0.94      84     1.24
  Date.now         8,158,358 1.30      92     1.00
```

## defaultTestRunner

The exported `measure` and `speed` belong to the also exported `defaultTestRunner`. But you could create your own just as easily.

<!-- USEFILE: examples\create-own.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->
``` ts
import {PerformanceTestRunner} from "performance-test-runner";
import {runAndReport} from "performance-test-runner/lib/suite-console-printer";

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
```
*You can find this in `examples\create-own.ts`*

The default runner is handy to spread your definition on multiple files without having the other tests know about the circumstance of their invoking.

<!-- USEFILE: examples\spread-definition.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->
``` ts
import {defaultTestRunner} from 'performance-test-runner';
import {runAndReport} from "performance-test-runner/lib/suite-console-printer";

import 'test-for-feature-a';
import 'test-for-feature-b';
import 'test-for-feature-c';

runAndReport(defaultTestRunner);
```
*You can find this in `examples\spread-definition.ts`*

## context injection

Since this package is using the `benchmark` package under the hood some constrains apply. One of the major things to keep in mind is that the benchmark package compiles the test function (and its corresponding setup and teardown) to one continues code block in some circumstances. Since it is not well documented when this is the case and when not, this package forces the compilation to create a uniform behavior.

But this joining of the bodies from the corresponding functions and recompiling by the `function` function results in the loss of the context. Which in turn results in the loss of any closure the test function wanted to use.

To allow the use of references from outside of the test function scope, this package provides another attribute in the `test` function. This given `context` object is available as either the identifier `global` or `window` (which are shadowed) by the benchmark package. This package extends this by unrolling the keys of the object, which can ease the usage if you keep the name for a seamless usage (see the arr example at the bottom).

<!-- USEFILE: examples\context.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->
``` ts
import {defaultTestRunner, measure, speed} from "performance-test-runner";
import {runAndReport} from "performance-test-runner/lib/suite-console-printer";

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
```
*You can find this in `examples\context.ts`*

## presenting results

`PerformanceTestRunner::extractTestResults` returns a graph similar to the graph resulting from the `measure` and `speed` calls. But this package provides utility to format those results in a more readable format. The easiest way to create a realtime readable log is to use the `runAndReport` function. 

<!-- USEFILE: examples\log-results.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->
``` ts
import {defaultTestRunner, measure, speed} from "performance-test-runner";
import {printSuiteState, runAndReport} from "performance-test-runner/lib/suite-console-printer";

import {formatResultTable} from "performance-test-runner/lib/stringify-result-table";

let global: any;

measure('copy array', () => {
    const arr = new Array(200).fill(0);
    delete arr[100];

    speed('slice', {arr}, () => {
        arr.slice();
    });

    speed('array of', {arr}, () => {
        Array.from(arr); // can not handle empty slots (EMPTY => undefined)
    });

    speed('spread', {arr}, () => {
        [...arr]; // can not handle empty slots (EMPTY => undefined)
    });
});

// you can either call the this helper:

// runAndReport(defaultTestRunner);

// or you can construct the output logger yourself and customize it
(async () => {
    // this function will attach the listeners on the PerformanceTestRunner and log its state on change in place (to see
    // the results live)
    const logger = printSuiteState(defaultTestRunner, {printOnCycle: true, framerate: 30});

    // running the suite
    await defaultTestRunner.runSuite();

    // you only need to await the logger if you want to print something else after the performance test run
    await logger;

    // this will format it in the same way as the logger does
    const formattedResult = formatResultTable(defaultTestRunner.extractTestResults());
})()
    .catch(err => {
        let actualError = err;
        if (err.type == 'error')
            actualError = err.message;

        console.error(actualError);
        process.exit(1);
    });
```
*You can find this in `examples\log-results.ts`*

This is the simplest way to log the performance measurements in realtime. If you do not need realtime logging you can just use the `formatResultTable(runner.extractTestResults())` function.

## teardown and setup

Since this package uses the benchmark module you can use a setup-test-teardown lifecycle. You can provide those by supplying more than one function to the `speed` call.

Benchmark will concat the code in the setup, test and teardown functions with the `Function` function, which changes the context of the code which results in the break of the closure scope. This means that you can not use any identifier defined outside of one of the three functions.

<!-- USEFILE: examples\setup-teardown.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->
``` ts
import {defaultTestRunner, measure, speed} from "performance-test-runner";
import {runAndReport} from "performance-test-runner/lib/suite-console-printer";

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
```
*You can find this in `examples\setup-teardown.ts`*

## baseline

This package also provides some tests meant to provide a baseline. Those results can give an insight in the performance of the runtime used to run the tests. Even with those test you can not compare test from one runtime / machine with the results from another but might at least give an idea of the differences.

To include those you can just call the `baselineBundleBasic` function.

<!-- USEFILE: examples\baseline.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->
``` ts
import {defaultTestRunner, measure, speed} from "performance-test-runner";
import {runAndReport} from "performance-test-runner/lib/suite-console-printer";

import {baselineBundleBasic} from "performance-test-runner/lib/baseline";

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
```
*You can find this in `examples\baseline.ts`*

## submitting issues
 
Please try to create your benchmark manually with the benchmark package when you encounter an issue to ensure that it is actually an error with this package. Be aware that the recompilation can lead to counterintuitive behavior since the scope is broken. 