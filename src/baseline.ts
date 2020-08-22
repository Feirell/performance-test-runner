import {measure as defaultMeasure, speed as defaultSpeed} from "./performance-test-suite";

export function baselineFunctionFor(speed = defaultSpeed) {
    speed('for', () => {
        for (let i = 0; i < 1000; i++) ;
    });
}

export function baselineFunctionArraySpread(speed = defaultSpeed) {
    const array = new Array(200);
    for (let i = 0; i < 200; i++)
        array[i] = i;

    speed('array spread', () => {
        let n = [...array];
    });
}

export function baselineFunctionWalkProto(speed = defaultSpeed) {
    const a = {test: 40};
    const b = Object.create(a);
    const c = Object.create(b);
    const d = Object.create(c);
    const e = Object.create(d);

    speed('walk proto', () => {
        'test' in e;
    });
}

export function baselineFunctionObjectSpread(speed = defaultSpeed) {
    const object = {
        testA: 1,
        testB: 2,
        testC: 3,
        testD: 4,
        testE: 5,
        testF: 6,
        testG: 7,
        testH: 8
    };

    speed('object spread', () => {
        let n = {...object};
    });
}

export function baselineFunctionModulo(speed = defaultSpeed) {
    let i = 0;
    speed('modulo', () => {
        let d = 5007.4 + i++;
        d %= 2;
        d %= 3;
        d %= 5;
        d %= 7;
        d %= 11;
        d %= 13;
        d %= 17;
        d %= 19;
        d %= 23;
    });
}

export function baselineFunctionAddition(speed = defaultSpeed) {
    let i = 0;
    speed('addition', () => {
        let d = 5007.4 + i++;
        d += 2;
        d += 3;
        d += 5;
        d += 7;
        d += 11;
        d += 13;
        d += 17;
        d += 19;
        d += 23;
    });
}

export function baselineBundleBasic(measure = defaultMeasure, speed = defaultSpeed) {
    measure('basline: basic bundle', () => {
        baselineFunctionFor(speed);
        baselineFunctionArraySpread(speed);
        baselineFunctionWalkProto(speed);
        baselineFunctionObjectSpread(speed);
        baselineFunctionModulo(speed);
        baselineFunctionAddition(speed);
    });
}