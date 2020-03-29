const
    Gpio = require('onoff').Gpio,
    config = require('config');

const ledNames = {
    SIDE_ONE_GREEN: "SIDE_ONE_GREEN",
    SIDE_TWO_GREEN: "SIDE_TWO_GREEN",
    SYSTEM_GREEN: "SYSTEM_GREEN",
    SYSTEM_RED: "SYSTEM_RED"
};

module.exports = {
    ledNames,
    turnOn,
    turnOff,
    turnAllOff,
    blink,
    blinkFast,
    blinkAll,
    cleanupResources,
};


const leds = new Map();
leds.set(ledNames.SIDE_ONE_GREEN, new Gpio(19, 'out'));         // pin 35
leds.set(ledNames.SIDE_TWO_GREEN, new Gpio(22, 'out'));         // pin 15
leds.set(ledNames.SYSTEM_GREEN, new Gpio(11, 'out'));           // pin 23
leds.set(ledNames.SYSTEM_RED, new Gpio(9, 'out'));              // pin 21


function turnOn(ledName) {
    turnLedOn(leds.get(ledName));
}

function turnOff(ledName) {
    turnLedOff(leds.get(ledName));
}

function turnAllOff() {
    turnLedOff(leds.get(ledNames.SIDE_ONE_GREEN), 2);
    turnLedOff(leds.get(ledNames.SIDE_TWO_GREEN), 2);
    turnLedOff(leds.get(ledNames.SYSTEM_GREEN), 2);
    turnLedOff(leds.get(ledNames.SYSTEM_RED), 2);
}

function blink(ledName, numBlinks) {
    return blinkAtRate(ledName, numBlinks, config.get('BLINK_INTERVAL_MILLIS'));
}

function blinkFast(ledName, numBlinks) {
    return blinkAtRate(ledName, numBlinks, config.get('BLINK_FAST_INTERVAL_MILLIS'));
}

async function blinkAll(numBlinks) {
    return Promise.all([
        blink(ledNames.SIDE_ONE_GREEN, numBlinks),
        blink(ledNames.SIDE_TWO_GREEN, numBlinks),
        blink(ledNames.SYSTEM_GREEN, numBlinks),
        blink(ledNames.SYSTEM_RED, numBlinks)
    ]);
}

function cleanupResources() {
    leds.get(ledNames.SIDE_ONE_GREEN).writeSync(0);
    leds.get(ledNames.SIDE_ONE_GREEN).unexport();

    leds.get(ledNames.SIDE_TWO_GREEN).writeSync(0);
    leds.get(ledNames.SIDE_TWO_GREEN).unexport();

    leds.get(ledNames.SYSTEM_GREEN).writeSync(0);
    leds.get(ledNames.SYSTEM_GREEN).unexport();

    leds.get(ledNames.SYSTEM_RED).writeSync(0);
    leds.get(ledNames.SYSTEM_RED).unexport();
}


// ----- private (not exported) -----

function toggleLedState(led) {
    if (led.readSync() === 0) {
        led.writeSync(Gpio.HIGH);
    } else {
        led.writeSync(Gpio.LOW);
    }
}

function blinkAtRate(ledName, numBlinks, blinkInterval) {
    // noinspection JSUnusedLocalSymbols
    return new Promise((resolve, reject) => {
        let numToggles = numBlinks * 2;     // two toggles needed for each blink

        let toggleCount = 0;
        let intervalID = setInterval(function () {
                toggleLedState(leds.get(ledName));
                toggleCount ++;

                if (toggleCount === numToggles) {
                    clearInterval(intervalID);
                    resolve();
                }
            },
            blinkInterval
        );
    });
}

function turnLedOn(led) {
    led.writeSync(Gpio.HIGH);
}

function turnLedOff(led) {
    led.writeSync(Gpio.LOW);
}
