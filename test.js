const assert = require('assert');

const {
    Bezier,
    StaticBezier,
    AT_FUNCTIONS_NAMES,
    TSEARCH_FUNCTIONS_NAMES
} = require('..');

function inRange(is, should, range = 1e-5) {
    if (!isFinite(is))
        assert.fail(is + ' is not finite');

    if (!(Math.abs(is - should) <= range))
        assert.fail('' + is + ' is not in the range of ' + should + ' is off by ' + (Math.abs(is - should) - range));
}

function oneInRange(isses, should, range = 1e-5) {
    for (const is of isses)
        try {
            inRange(is, should, range);
            return;
        } catch (e) { }

    assert.fail('[' + isses + '] is not in the range of ' + should);
}

describe('Bezier', () => {
    const holdingPointVariations = [
        {
            holdingPoint: [[0, 2], [1, 1], [2, 0]],
            solutions: [{
                dimension: 1,
                xValue: 1.8,
                tValue: 0.1
            }]
        },
        {
            holdingPoint: [[0, 0], [2, 1]],
            solutions: [{
                dimension: 0,
                xValue: 1,
                tValue: 0.5
            }]
        }, {
            holdingPoint: [[0, 0], [0, 1], [1, 1]],
            solutions: [{
                dimension: 0,
                xValue: 0.25,
                tValue: 0.5
            }]
        }, {
            holdingPoint: [[0, 0], [1, 0], [0, 1], [1, 1]],
            solutions: [{
                dimension: 0,
                xValue: 0.468,
                tValue: 0.3
            }]
        }];

    describe('StaticBezier at', () => {
        const quadratic = holdingPointVariations[3];

        const bezier = new StaticBezier(quadratic.holdingPoint);

        it('bezier.at(0.3) ≈ [0.468, 0.216]', () => {
            const res = bezier.at(0.3);
            inRange(res[0], 0.468);
            inRange(res[1], 0.216);
        });

        it('bezier.at(0) ≈ [0, 0]', () => {
            const res = bezier.at(0);
            inRange(res[0], 0);
            inRange(res[1], 0);
        });

        it('bezier.at(1) ≈ [1, 1]', () => {
            const res = bezier.at(1);
            inRange(res[0], 1);
            inRange(res[1], 1);
        });
    })

    for (const name of AT_FUNCTIONS_NAMES) {
        describe('Bezier with atFunction "' + name + '"', () => {
            const quadratic = holdingPointVariations[3];

            const bezier = new Bezier(quadratic.holdingPoint, name);

            it('bezier.at(0.3) ≈ [0.468, 0.216]', () => {
                const res = bezier.at(0.3);
                inRange(res[0], 0.468);
                inRange(res[1], 0.216);
            });

            it('bezier.at(0) ≈ [0, 0]', () => {
                const res = bezier.at(0);
                inRange(res[0], 0);
                inRange(res[1], 0);
            });

            it('bezier.at(1) ≈ [1, 1]', () => {
                const res = bezier.at(1);
                inRange(res[0], 1);
                inRange(res[1], 1);
            });
        });
    }

    describe('StaticBezier tSearch', () => {

        for (const { holdingPoint, solutions } of holdingPointVariations) {
            const bezier = new StaticBezier(holdingPoint);

            for (const { xValue, dimension, tValue } of solutions)
                it('bezier.tSearch(' + xValue + ', ' + dimension + ') ≈ ' + tValue, () => {
                    const res = bezier.tSearch(xValue, dimension);
                    oneInRange(res, tValue, 1e-4);
                });

        }
    });

    for (const name of TSEARCH_FUNCTIONS_NAMES) {
        describe('Bezier with tSearchFunction "' + name + '"', () => {

            for (const { holdingPoint, solutions } of holdingPointVariations) {
                const bezier = new Bezier(holdingPoint, undefined, name);

                for (const { xValue, dimension, tValue } of solutions)
                    it('bezier.tSearch(' + xValue + ', ' + dimension + ') ≈ ' + tValue, () => {
                        const res = bezier.tSearch(xValue, dimension);
                        oneInRange(res, tValue, 1e-4);
                    });

            }
        });
    }
});