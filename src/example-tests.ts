import {defaultTestSuite, measure, speed} from "./performance-test-suite";
import {depthFirst, mapDepthFirst} from "./tree-walker";
import {ReplacePrinter} from "replace-printer";
import {formatResultTable} from "./stringify-result-table";

const tree = [
    {
        title: 'container-a',
        containing: [
            {title: 'element-a'},
            {title: 'element-b'}
        ]
    },
    {
        title: 'container-b',
        containing: [
            {title: 'element-c'},
            {
                title: 'container-d',
                containing: [
                    {title: 'element-e'}
                ]
            }
        ]
    }
];

const mapper = (elem: { title: string }) => {
    if (elem.title == 'container-b')
        return {title: 'other'};

    return elem;
}

measure('depthFirst', () => {

    speed('map', () => {
        mapDepthFirst(tree, elem => {
            if (elem.title == 'element-a')
                return {};

            return elem;
        });
    });

    speed('traverse', () => {
        depthFirst(tree, () => {
        });
    });

    // speed('map with json', () => {
    //     const copied = JSON.parse(JSON.stringify(tree));
    //     depthFirst(copied, () => {
    //     });
    // })
});

// baselineBundleBasic();

(async () => {
    // printSuiteState(defaultTestSuite)
    //     .catch(err => {
    //         console.error(err);
    //         process.exit(1);
    //     });
    let cc: Console;
    let rc: Console;

    const rp1 = new ReplacePrinter();

    cc = rp1.continuesConsole;
    rc = rp1.replaceConsole;

    const logState = () => rc.log(formatResultTable(defaultTestSuite.extractTestResults()));

    /*
    'suite-started'
    'benchmark-cycle'
    'benchmark-started'
    'benchmark-error'
    'benchmark-finished'
    'suite-error'
    'suite-finished'
     */

    defaultTestSuite.addListener('suite-started', logState);
    defaultTestSuite.addListener('benchmark-started', logState);
    defaultTestSuite.addListener('benchmark-cycle', logState);
    defaultTestSuite.addListener('benchmark-finished', logState);
    defaultTestSuite.addListener('suite-finished', logState);

    // const firstLogger = printSuiteState(defaultTestSuite);
    cc.log('run first time');
    await defaultTestSuite.runSuite();

    console.log('\n');
    const rp2 = new ReplacePrinter();

    cc = rp2.continuesConsole;
    rc = rp2.replaceConsole;


    cc.log('run second time');
    await defaultTestSuite.runSuite();
})()
    .catch(err => {
        console.error('encountered an error while running example tests', err);
        process.exit(1);
    })

