module.exports = {
    blinkLed,
    toggleLedState,
    turnLedOn,
    turnLedOff
};

const BLINK_INTERVAL_MILLIS = 500;

function blinkLed(led, numBlinks) {
    // noinspection JSUnusedLocalSymbols
    return new Promise((resolve, reject) => {
        let numToggles = numBlinks * 2;     // two toggles needed for each blink

        let toggleCount = 0;
        let intervalID = setInterval(function () {
            toggleLedState(led);
            toggleCount ++;

            if (toggleCount === numToggles) {
                clearInterval(intervalID);
                resolve();
            }
        }, BLINK_INTERVAL_MILLIS);
    })
}

function toggleLedState(led) {
    if (led.readSync() === 0) {
        led.writeSync(1);
    } else {
        led.writeSync(0);
    }
}

function turnLedOn(led) {
    led.writeSync(1);
}

function turnLedOff(led) {
    led.writeSync(0);
}