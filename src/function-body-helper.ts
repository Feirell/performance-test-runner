/**
 * This function find the enclosing brackets in a string. For example if you use beginChar == '(' and endChar == ')'
 * and you would supply the string "test (another (other))" this function would return the index of the first ( and the
 * and the corresponding ) (not the last but the one which closes this bracket).
 *
 * @param str the string to search in
 * @param beginChar the start for an enclosing
 * @param endChar the end for the enclosing
 * @param startInString the character offset to use (default to zero)
 */
export function findEnclosing(str: string, beginChar: string, endChar: string, startInString = 0) {
    let start = undefined;
    let charIndex = startInString;
    let depth = 0;
    let inStr = false;
    let escape = false;

    for (let c of str.slice(startInString)) {
        if (c == '\'' ||
            c == '\"' ||
            c == '\`') {
            if (!escape)
                inStr = !inStr;
        } else if (!inStr) {
            if (c == beginChar) {
                if (depth == 0)
                    start = charIndex;

                depth++;
            } else if (c == endChar) {
                if (--depth == 0)
                    return [start, charIndex];
            }
        }

        escape = c == '\\' && !escape;

        charIndex++;
    }

    return [undefined, undefined];
}

export function extractFunctionBodyString(fnc: Function) {
    const fncStr = '' + fnc;

    const [startPara, endPara] = findEnclosing(fncStr, '(', ')');
    const [startBlock, endBlock] = findEnclosing(fncStr, '{', '}', endPara);

    return fncStr.slice(startBlock + 1, endBlock).trim();
}