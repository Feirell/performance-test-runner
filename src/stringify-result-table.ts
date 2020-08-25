import {depthFirst} from "./tree-walker";
import {SPTRGroup, SPTRMeasurementInitialized, SPTRMeasurementsRunningFinished} from "./performance-test-suite";

const fmrNoFrac = Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    useGrouping: true
}).format;

const fmrFrac = Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    useGrouping: true
}).format;

export type PossibleTableFormatterTypes =
    SPTRMeasurementInitialized |
    SPTRMeasurementsRunningFinished |
    SPTRGroup;

export function formatResultTable(outputTree: SPTRGroup[], nodata = '--', indent = '  ') {
    // name, ops/sec, MoE, samples, relative

    // index is the depth, the value is the number which is ready to compare
    const readyToComp: number[] = [];

    let rows: (string | string[])[] = [['', 'ops/sec', 'MoE', 'samples', 'relative']];
    const columnLeftAlignment = [true, false, false, false];
    const minRowSize = [0, nodata.length, nodata.length, nodata.length, nodata.length];

    for (let i = 0; i < 5; i++)
        minRowSize[i] = Math.max(rows[0][i].length, minRowSize[i]);

    depthFirst<SPTRMeasurementInitialized | SPTRMeasurementsRunningFinished, SPTRGroup>(outputTree, (e, p, number, depth) => {
        if (e.type != 'group')
            return;

        rows.push(indent.repeat(depth - 1) + e.name);

        let minHz;

        const ind = indent.repeat(depth);
        let testRows = [];
        for (const test of e.containing) {
            if (test.type != 'measurements')
                continue;

            const name = ind + test.name;
            if (test.state == 'initialized') {
                testRows.push([name, nodata, nodata, nodata, nodata]);
                minRowSize[0] = Math.max(name.length, minRowSize[0]);
            } else {
                // added hz in the last slot is technically wrong but much easier in mapping
                const row = [name, fmrNoFrac(test.hz), fmrFrac(test.rme), fmrNoFrac(test.samples), test.hz];

                for (let i = 0; i < 4; i++)
                    minRowSize[i] = Math.max((row[i] as string).length, minRowSize[i]);

                testRows.push(row);

                if (minHz == undefined || test.hz < minHz)
                    minHz = test.hz;
            }
        }

        for (const test of testRows) {
            if (test[4] != nodata)
                test[4] = fmrFrac(test[4] / minHz);

            minRowSize[4] = Math.max((test[4] as string).length, minRowSize[4]);
        }

        rows = rows.concat(testRows);
    });

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // row which do not contain a string[] but a string are header rows
        if (typeof row == 'string')
            continue;

        let str = '';
        for (let i = 0; i < 5; i++) {
            if (i > 0)
                str += ' ';

            str += row[i][columnLeftAlignment[i] ? 'padEnd' : 'padStart'](minRowSize[i], ' ');
        }

        rows[i] = str;
    }

    return rows.join('\n');
}
