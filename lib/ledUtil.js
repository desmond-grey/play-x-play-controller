const Gpio = require('onoff').Gpio;
    module.exports = {
    blinkLed,
    blinkAllLedsTwice,
    turnLedOn,
    turnLedOff,
    turnAllLedsOff
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

async function blinkAllLedsTwice() {
    return Promise.all([
        blinkLed(sideOneLedGreen, 2),
        blinkLed(sideTwoLedGreen, 2),
        blinkLed(systemLedGreen, 2),
        blinkLed(systemLedRed, 2)
    ]);
}

function turnLedOn(led) {
    led.writeSync(Gpio.HIGH);
}

function turnLedOff(led) {
    led.writeSync(Gpio.LOW);
}

function turnAllLedsOff() {
    turnLedOff(sideOneLedGreen);
    turnLedOff(sideTwoLedGreen);
    turnLedOff(systemLedGreen);
    turnLedOff(systemLedRed);
}


// ----- private -----

function toggleLedState(led) {
    if (led.readSync() === 0) {
        led.writeSync(Gpio.HIGH);
    } else {
        led.writeSync(Gpio.LOW);
    }
}
