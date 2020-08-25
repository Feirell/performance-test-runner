# performance-test-runner

This package is meant to help you define benchmarks for the [benchmark package](https://www.npmjs.com/package/benchmark) package in a similar way as you can with karma etc.

This package exposes one main class `PerformanceTestRunner` which has two central attributes `measure` and `speed` which are methods which you can use to construct a test graph like you can do with `describe` and `it` for unit testing.

For example if you wanted to test whether `performance.now` or `Date.now` is faster you could create you benchmarks like this:

<!-- USEFILE: examples\simple-tests.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

## defaultTestRunner

The exported `measure` and `speed` belong to the also exported default `defaultTestRunner` which you can use but there is no need to use those.

<!-- USEFILE: examples\create-own.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

The default runner is handy to spread your definition on multiple files like this.

<!-- USEFILE: examples\spread-definition.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

## presenting results

`PerformanceTestRunner::extractTestResults` returns a graph similar to the graph resulting from the `measure` and `speed` calls. But this package provides utility to format those results in a more readable format.

<!-- USEFILE: examples\log-results.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

This is the simplest way to log the performance measurements in realtime. If you do not need realtime logging you can just use the `formatResultTable(runner.extractTestResults())` function.

## teardown and setup

Since this package uses the benchmark module you can use a teardown-test-teardown lifecycle. You can provide those by supplying more than one function to the `speed` call. Be aware that the behavior of the test changes when you provide the setup or the teardown.

Benchmark will concat the code in the teardown, setup and teardown functions with the `Function` function, which changes the context of the code which results in the break of the closure scope. Which means that you can not use anything which you defined outside of one of the three functions.

As shown in this example you need to import / require you external functions inside the setup function to use that again. To help your IDE / TypeScript with this behavior you can use `var` since it does not raise a syntax exception when you redeclare and identifier.

<!-- USEFILE: examples\setup-teardown.ts; str => str.replace(/\.\.\/src/g, 'performance-test-runner/lib').replace(/performance-test-runner\/lib\/performance-test-runner/,'performance-test-runner') -->

## submitting issues
 
Please try to create your benchmark manually with the benchmark package when you encounter an issue to ensure that it is actually an error with this package. There are known issues with benchmark for example will `throw` cause the code to be recompiled by benchmark, like it is the case with setup and teardown, which results in the changed scope.

This might seem counterintuitive, because it could result in errors that identifier are missing, since the identifier is the result of an import.

This and other edge cases can result in unexpected behavior, therefore please make sure that your test works with the benchmark package before opening an issue.
