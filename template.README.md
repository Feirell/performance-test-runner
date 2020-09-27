# performance-test-runner

This package is meant to help you define benchmarks for the [benchmark package](https://www.npmjs.com/package/benchmark) in a similar way as you can define unit tests with karma etc.

This package exposes one main class `PerformanceTestRunner` which has two central methods `measure` and `speed` which you can use to construct a test graph like you can do with `describe` and `it` for unit testing.

For example if you wanted to test whether `performance.now` or `Date.now` is faster you could create you benchmarks like this.

<!-- USEFILE: examples\simple-tests.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

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

The default runner is handy to spread your definition on multiple files without having the other tests know about the circumstance of their invoking.

<!-- USEFILE: examples\spread-definition.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

## context injection

Since this package is using the `benchmark` package under the hood some constrains apply. One of the major things to keep in mind is that the benchmark package compiles the test function (and its corresponding setup and teardown) to one continues code block in some circumstances. Since it is not well documented when this is the case and when not, this package forces the compilation to create a uniform behavior.

But this joining of the bodies from the corresponding functions and recompiling by the `function` function results in the loss of the context. Which in turn results in the loss of any closure the test function wanted to use.

To allow the use of references from outside of the test function scope, this package provides another attribute in the `test` function. This given `context` object is available as either the identifier `global` or `window` (which are shadowed) by the benchmark package. This package extends this by unrolling the keys of the object, which can ease the usage if you keep the name for a seamless usage (see the arr example at the bottom).

<!-- USEFILE: examples\context.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

## presenting results

`PerformanceTestRunner::extractTestResults` returns a graph similar to the graph resulting from the `measure` and `speed` calls. But this package provides utility to format those results in a more readable format. The easiest way to create a realtime readable log is to use the `runAndReport` function. 

<!-- USEFILE: examples\log-results.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

This is the simplest way to log the performance measurements in realtime. If you do not need realtime logging you can just use the `formatResultTable(runner.extractTestResults())` function.

## teardown and setup

Since this package uses the benchmark module you can use a setup-test-teardown lifecycle. You can provide those by supplying more than one function to the `speed` call. Be aware that the behavior of the test changes when you provide the setup or the teardown.

Benchmark will concat the code in the setup, test and teardown functions with the `Function` function, which changes the context of the code which results in the break of the closure scope. This means that you can not use any identifier defined outside of one of the three functions.

As shown in this example you need to import / require your external functions inside the setup function to use them again. To help your IDE / TypeScript with this behavior you can use `var` since it does not raise a syntax exception when you redeclare an identifier.

<!-- USEFILE: examples\setup-teardown.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

## baseline

This package also provides some tests meant to provide a baseline. Those results can give an insight in the performance of the runtime used to run the tests. Even with those test you can not compare test from one runtime / machine with the results from another but might at least give an idea of the differences.

To include those you can just call the `baselineBundleBasic` function.

<!-- USEFILE: examples\baseline.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

## submitting issues
 
Please try to create your benchmark manually with the benchmark package when you encounter an issue to ensure that it is actually an error with this package. There are known issues with benchmark for example will `throw` cause the code to be recompiled by benchmark, like it is the case with setup and teardown, which results in the changed scope.

This might seem counterintuitive, because it could result in errors that identifier are missing, since the identifier is the result of an import.

This and other edge cases can result in unexpected behavior, therefore please make sure that your test works with the benchmark package before opening an issue.
