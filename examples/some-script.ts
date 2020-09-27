import {performance} from "perf_hooks";

export class Example {

    constructor() {
        // some initialization
    }

    run() {
        const start = performance.now();
        while (performance.now() - start <= 2) ;
    }
}