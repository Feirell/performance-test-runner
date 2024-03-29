interface Recursive<K> {
    // TODO find a way to set the type to `typeof this | K` so the actual type is known not just the interface
    // then remove the `as K | T`
    containing: (Recursive<K> | K)[];
}

type MapDepthFirstCB<K, T extends Recursive<K> = Recursive<K>, M = void, L extends Recursive<M> = Recursive<M>> = (current: T | K, parent: T, number: number, depth: number, fullPoint: number[], skipContainer: () => void) => M | L;


type MapDepthFirstCBAsync<K, T extends Recursive<K> = Recursive<K>, M = void, L extends Recursive<M> = Recursive<M>> = (current: T | K, parent: T, number: number, depth: number, fullPoint: number[], skipContainer: () => void) => Promise<M | L>;


const isRecursive = <U>(o: Recursive<U> | U): o is Recursive<U> => 'containing' in o;

export function depthFirst<K, T extends Recursive<K> = Recursive<K>>(tree: T | T[], callback: MapDepthFirstCB<K, T>) {
    if (!Array.isArray(tree))
        tree = [tree];

    let number = 0;

    let shouldSkip = false;
    const skipContainer = () =>
        shouldSkip = true;

    const recWalker = (node: K | T, parent: T, position: number[]) => {
        callback(node, parent, number++, position.length, position, skipContainer);

        if (shouldSkip) {
            shouldSkip = false;
            return;
        }

        if (!isRecursive(node))
            return;

        const nodeCon = node.containing;
        for (let i = 0; i < nodeCon.length; i++)
            recWalker(nodeCon[i] as K | T, node, [...position, i]);
    }

    for (let i = 0; i < tree.length; i++)
        recWalker(tree[i], undefined, [i]);
}

export async function depthFirstAsync<K, T extends Recursive<K> = Recursive<K>>(tree: T | T[], callback: MapDepthFirstCBAsync<K, T>) {
    if (!Array.isArray(tree))
        tree = [tree];

    let number = 0;

    let shouldSkip = false;
    const skipContainer = () =>
        shouldSkip = true;

    const recWalker = async (node: K | T, parent: T, position: number[]) => {
        await callback(node, parent, number++, position.length, position, skipContainer);

        if (shouldSkip) {
            shouldSkip = false;
            return;
        }

        if (!isRecursive(node))
            return;

        const nodeCon = node.containing;
        for (let i = 0; i < nodeCon.length; i++)
            await recWalker(nodeCon[i] as K | T, node, [...position, i]);
    }

    for (let i = 0; i < tree.length; i++)
        await recWalker(tree[i], undefined, [i]);
}

export function mapDepthFirst<K, T extends Recursive<K> = Recursive<K>, M = any, L extends Recursive<M> = Recursive<M>>(tree: T | T[], callback: MapDepthFirstCB<K, T, M, L>): M[] {
    if (!Array.isArray(tree))
        tree = [tree];

    let number = 0;

    let shouldSkip = false;
    const skipContainer = () =>
        shouldSkip = true;

    const recWalker = (node: K | T, parent: T, position: number[]): M | L => {
        let repl = callback(node, parent, number++, position.length, position, skipContainer);

        if (node as any == repl as any)
            repl = {...repl};

        if (!isRecursive(repl))
            return repl;

        if (shouldSkip) {
            shouldSkip = false;
            return repl;
        }

        if (isRecursive(node)) {
            const nodeCon = node.containing;
            const replCon = repl.containing = new Array(nodeCon.length);

            for (let i = 0; i < nodeCon.length; i++)
                replCon[i] = recWalker(nodeCon[i] as K | T, node, [...position, i]);
        } else {
            repl.containing = [];
        }

        return repl;
    }

    const ret = new Array(tree.length);

    for (let i = 0; i < tree.length; i++)
        ret[i] = recWalker(tree[i], undefined, [i]);

    return ret;
}

/*
export function depthFirst<T extends Recursive>(tree: T | T[], callback: depthFirstCB<T>) {
    let indexes: number [] = [0];
    let parent = [];
    let stack: T[][] = [Array.isArray(tree) ? tree : [tree]];

    let currentContaining = stack;

    let number = 0;

    let shouldSkip = false;
    const skipContainer = () => shouldSkip = true;

    while (indexes.length > 0) {
        const currentIndex = indexes[0];
        const elem = currentContaining[0][currentIndex];

        const depth = stack.length;

        shouldSkip = false;
        callback(elem, parent[0], number, depth, indexes.slice(0).reverse(), skipContainer);

        number++;

        const isContainerWithElements = 'containing' in elem && elem.containing.length > 0;
        if (!shouldSkip && isContainerWithElements) {
            // going in one more depth
            parent.unshift(elem);
            stack.unshift(elem.containing as T[]);
            indexes.unshift(0);
        } else {
            // stepping one horizontal, next sibling
            indexes[0]++;

            while (stack.length > 0 && indexes[0] >= stack[0].length) {
                // this was the last element on this depth
                // move one layer upwards
                parent.shift();
                indexes.shift();
                stack.shift();

                // move away from the element which provided the last depth we stepped out of
                if (indexes.length > 0)
                    indexes[0]++;
            }
        }
    }
}

export function mapDepthFirst<T extends Recursive, M extends Recursive>(
    tree: T | T[],
    callback: mapDepthFirstCB<T, M>
): M[] {
    const root = [];

    depthFirst<T>(tree, (original: T, parent: T, number: number, depth: number, fullPoint: number[], skipContainer: () => void) => {
        const origIsContainer = isContainer(original);
        let replace = callback(original, parent, number, depth, fullPoint, skipContainer);
        const replIsContainer = isContainer(replace);

        // TODO create other way fully map
        if (replace as Recursive == original as Recursive)
            replace = {...replace};

        if (replIsContainer)
            replace.containing = []; // clearing the containing array

        // if this container was replaced with a non container
        if (origIsContainer && !replIsContainer)
            skipContainer();

        let containingArray = root;

        for (let i = 0; i < fullPoint.length - 1; i++)
            containingArray = containingArray[fullPoint[i]].containing;

        containingArray[fullPoint[fullPoint.length - 1]] = replace;
    });

    return root;
}

 */