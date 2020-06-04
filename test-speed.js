const { TestGroup } = require('./test-group.js');

const {
    Bezier,
    StaticBezier,
    AT_FUNCTIONS_NAMES,
    TSEARCH_FUNCTIONS_NAMES
} = require('../'); // since an directory with an package.json is an package

let availableTSearchNames = Array.from(TSEARCH_FUNCTIONS_NAMES);
let availableAtNames = Array.from(AT_FUNCTIONS_NAMES);

availableTSearchNames.push('StaticBezier');
availableAtNames.push('StaticBezier');

const points = [
    [1, 5],
    [2, 6],
    [3, 7],
    [4, 8]
];

const arrayCopy = (inst, off = 0) => Array.prototype.slice.call(inst, off);
const args = arrayCopy(process.argv, 2);

new TestGroup('create-at', availableAtNames, name => {
    if (name == 'StaticBezier')
        return () => new StaticBezier(points);
    else
        return () => (new Bezier(points, name)).at(0);
});

new TestGroup('at', availableAtNames, name => {
    if (name == 'StaticBezier') {
        const sb = new StaticBezier(points);
        return () => sb.at(0.3);
    } else {
        const instance = new Bezier(points, name);
        return () => instance.at(0.3);
    }
});

new TestGroup('t-search', availableTSearchNames, name => {
    if (name == 'StaticBezier') {
        const sb = new StaticBezier(points);
        return () => sb.tSearch(1.9, 0); // ≈ 0.3
    } else {
        const instance = new Bezier(points, undefined, name);
        return () => instance.tSearch(1.9, 0); // ≈ 0.3
    }
});

const matcher = /--([a-z-]+)=(.+)/;

for (let arg of args) {
    const m = matcher.exec(arg);

    if (m == null) {
        for (let group of TestGroup.getAllGroups())
            group.addFilterString(arg);
    } else {
        let group = TestGroup.getGroupByName(m[1]);
        if (group) {
            group.addFilterString(m[2]);
        }
    }
}

TestGroup.testAllGroups(true);