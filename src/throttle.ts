export function createThrottle(action: () => void, desiredTimout: number) {
    let promiseRes = [];
    let timeoutId = undefined;
    let appointedNextCallTS = undefined;

    let actionNeeded = false;

    const doAction = () => {
        action();

        for (const res of promiseRes)
            res();

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

    return (printImmediately = false) => new Promise((res, rej) => {
        promiseRes.push(res);

        if (printImmediately) {
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