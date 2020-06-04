import {defaultTestSuite, measure, speed} from "./performance-test-group";

measure('measure root 1.', () => {
    speed('speed 1.1.', () => {
        console.log('speed 1.1.');
    });

    speed('speed 1.2.', () => {
        console.log('speed 1.2.');
    });

    measure('measure 1.1.', () => {
        speed('speed 1.1.1', () => {
            console.log('speed 1.1.1');
        });
    });
});

measure('measure root 2.', () => {
    speed('speed 2.1.', () => {
        console.log('speed 2.1.');
    });

    speed('speed 2.2.', () => {
        console.log('speed 2.2.');
    });

    measure('measure 2.1.', () => {
        speed('speed 2.1.1', () => {
            console.log('speed 2.1.1');
        });
    });
});


console.log(JSON.stringify((defaultTestSuite as any).testTree, undefined, 2));