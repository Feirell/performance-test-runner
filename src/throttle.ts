export function createThrottle<T extends () => void>(action: T, desiredTimout: number) {
    let promiseRes = [];
    let promiseRej = [];

    let timeoutId = undefined;
    let appointedNextCallTS = undefined;

    let actionNeeded = false;

    let lastCallArgs: Parameters<T> = undefined;

    const doAction = () => {
        try {
            action.apply(undefined, lastCallArgs);
        } catch (err) {
            for (const rej of promiseRej)
                try {
                    rej(err);
                } catch (e) {
                    console.error(e);
                }

            promiseRej = [];
        }

        for (const res of promiseRes)
            try {
                res();
            } catch (e) {
                console.error(e);
            }

        promiseRes = [];
    }

    const createTimeout = () => {
        const currentTS = Date.now();
        let calibratedTimeout = desiredTimout;

        if (appointedNextCallTS) {
            // if we skipped multiple slots, we need to jump those otherwise we get some with timeout negative
            // which results in a burst after the interval could not keep up
            if (appointedNextCallTS < currentTS) {
                appointedNextCallTS += Math.ceil((currentTS - appointedNextCallTS) / desiredTimout) * desiredTimout
            }

            calibratedTimeout = appointedNextCallTS - currentTS;

            appointedNextCallTS += desiredTimout;
        } else {
            appointedNextCallTS = currentTS + desiredTimout;
        }


        timeoutId = setTimeout(() => {
            timeoutId = undefined;

            if (!actionNeeded) {
                appointedNextCallTS = undefined;
                return;
            }

            actionNeeded = false;
            doAction();

            createTimeout();
        }, calibratedTimeout);
    }

    return (doImmediately = false, ...param: Parameters<T>) => new Promise<void>((res, rej) => {
        lastCallArgs = param;
        promiseRes.push(res);
        promiseRej.push(rej);

        if (doImmediately) {
            if (timeoutId)
                clearTimeout(timeoutId);

            doAction();
        } else {
            if (!timeoutId) {
                actionNeeded = false;
                doAction();

                createTimeout();
            } else
                actionNeeded = true;
        }
    });
}