const { Suite } = require('benchmark');
const formatter = require('benchmark-suite-formatter');

const arrayCopy = (inst, off = 0) => Array.prototype.slice.call(inst, off);
const isValidRegExp = regExpString => {
    try {
        new RegExp(regExpString);
        return true;
    } catch (e) { return false; }
}

class TestGroup {
    constructor(name, paramArray, testFunctionProducer) {
        TestGroup.allGroups.push(this);

        this.name = name;
        this.defaultArray = paramArray;
        this.testFunctionProducer = testFunctionProducer;

        this.none = false;
        this.regExpStrings = [];

    }

    getSuiteString() {
        return this.suite ? formatter.stringifySuite(this.suite) : undefined;
    }

    runSuite() {
        return new Promise((resolve, reject) => {
            if (!this.suite)
                resolve();

            this.suite.on('complete', () => resolve());

            this.suite.on('error', (err) => reject({
                nameSuite: this.name,
                nameFunction: err.target.name,
                code: err.target.compiled.toString(),
                error: err.target.error
            }));

            this.suite.run({
                'async': true
            });
        })
    }

    createSuite() {
        const allFuncts = this.getAllTestsFunctions();

        if (allFuncts.length == 0)
            return;

        this.suite = new Suite(this.name);

        for (const { name, func } of allFuncts)
            this.suite.add(name, func);
    }

    addFilterString(str) {
        if (str == 'none')
            this.none = true;
        else if (str.length > 0 && isValidRegExp(str) && !this.regExpStrings.includes(str))
            this.regExpStrings.push(str);
    }

    getAllFittingFunctions() {
        if (this.none)
            return [];

        if (this.regExpStrings.length == 0)
            return arrayCopy(this.defaultArray);

        const regExp = new RegExp(this.regExpStrings.join('|'));
        return this.defaultArray.filter(str => regExp.test(str))
    }

    getAllTestsFunctions() {
        return this.getAllFittingFunctions().map(name => ({ name, func: this.testFunctionProducer(name) }));
    }

    static getGroupByName(name) {
        return TestGroup.getAllGroups().find(g => g.name == name) || null;
    }

    static getAllGroups() {
        return this.allGroups;
    }

    static logAllSuites() {
        const con = TestGroup.getAllGroups().map(group => group.getSuiteString()).filter(v => v != undefined);

        if (con.length > 0) {
            console.clear();
            console.log(con.join('\n\n'));
        }
    }

    static async testAllGroups(continues = true) {

        let timeoutID;
        if (continues)
            timeoutID = setInterval(() => {
                TestGroup.logAllSuites();
            }, 75);

        for (const testGroup of TestGroup.getAllGroups())
            testGroup.createSuite();

        for (const testGroup of TestGroup.getAllGroups())
            await testGroup.runSuite();

        if (continues)
            clearInterval(timeoutID);
        TestGroup.logAllSuites();
    }
}
TestGroup.allGroups = [];

module.exports = { TestGroup };