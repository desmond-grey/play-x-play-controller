const Gpio = require('onoff').Gpio;
module.exports = {
    turnOn,
    turnOff,
    turnAllOff,
    blink,
    blinkAll,
    cleanupResources
};

const BLINK_INTERVAL_MILLIS = 500;

const leds = new Map();
leds.set('SIDE_ONE_GREEN', new Gpio(19, 'out'));         // pin 35
leds.set('SIDE_TWO_GREEN', new Gpio(22, 'out'));         // pin 15
leds.set('SYSTEM_GREEN', new Gpio(11, 'out'));           // pin 23
leds.set('SYSTEM_RED', new Gpio(9, 'out'));              // pin 21


function turnOn(ledName) {
    turnLedOn(leds.get(ledName));
}

function turnOff(ledName) {
    turnLedOff(leds.get(ledName));
}

function turnAllOff() {
    turnLedOff(leds.get('SIDE_ONE_GREEN'), 2);
    turnLedOff(leds.get('SIDE_TWO_GREEN'), 2);
    turnLedOff(leds.get('SYSTEM_GREEN'), 2);
    turnLedOff(leds.get('SYSTEM_RED'), 2);
}

function blink(ledName, numBlinks) {
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
        }, BLINK_INTERVAL_MILLIS);
    })
}

async function blinkAll(numBlinks) {
    return Promise.all([
        blink('SIDE_ONE_GREEN', numBlinks),
        blink('SIDE_TWO_GREEN', numBlinks),
        blink('SYSTEM_GREEN', numBlinks),
        blink('SYSTEM_RED', numBlinks)
    ]);
}

function cleanupResources() {
    leds.get('SIDE_ONE_GREEN').writeSync(0);
    leds.get('SIDE_ONE_GREEN').unexport();

    leds.get('SIDE_TWO_GREEN').writeSync(0);
    leds.get('SIDE_TWO_GREEN').unexport();

    leds.get('SYSTEM_GREEN').writeSync(0);
    leds.get('SYSTEM_GREEN').unexport();

    leds.get('SYSTEM_RED').writeSync(0);
    leds.get('SYSTEM_RED').unexport();
}


// ----- private -----

function toggleLedState(led) {
    if (led.readSync() === 0) {
        led.writeSync(Gpio.HIGH);
    } else {
        led.writeSync(Gpio.LOW);
    }
}

function turnLedOn(led) {
    led.writeSync(Gpio.HIGH);
}

function turnLedOff(led) {
    led.writeSync(Gpio.LOW);
}
