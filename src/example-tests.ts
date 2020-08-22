import {defaultTestSuite, measure, speed} from "./performance-test-suite";
import {depthFirst, mapDepthFirst} from "./tree-walker";
import {baselineBundleBasic} from "./baseline";
import {printSuiteState} from "./suite-console-printer";

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

    speed('map with json', () => {
        const copied = JSON.parse(JSON.stringify(tree));
        depthFirst(copied, () => {
        });
    })
});

// baselineBundleBasic();

(async () => {
    // printSuiteState(defaultTestSuite)
    //     .catch(err => {
    //         console.error(err);
    //         process.exit(1);
    //     });

    console.log('run first time')
    const firstLogger = printSuiteState(defaultTestSuite);
    const firstRun = defaultTestSuite.runSuite();

    await firstLogger;
    await firstRun;

    console.log('run second time');
    const secondLogger = printSuiteState(defaultTestSuite);
    const secondRun = defaultTestSuite.runSuite();

    await secondLogger;
    await secondRun;
})()
    .catch(err => {
        console.error('encountered an error while running example tests', err);
        process.exit(1);
    })

