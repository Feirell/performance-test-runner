import {performance} from "perf_hooks";

export default function example() {
    const start = performance.now();
    while (performance.now() - start <= 2) ;
}