const StaticBezier = require('..').StaticBezier;

const sb = new StaticBezier([[0, 0], [1, 0], [0, 1], [1, 1]]);

console.log(sb.at(0.2));

// const produceGenericAtFunction = require('../cjs/at-functions/produced-generic').produceGenericAtFunction;

// const created = produceGenericAtFunction({
//     grade: 4,
//     dimension: 3
// });

// console.log(created.body);