const
    Gpio = require('onoff').Gpio,
    ledUtil = require('./lib/ledUtil'),
    pxpClient = require('./lib/pxpClient');

const TABLE_ID = 'prototype_controller';

const sideOneButton = new Gpio(26, 'in', 'both');     // pin 37
const sideOneLedGreen = new Gpio(19, 'out');          // pin 35
const sideTwoButton = new Gpio(27, 'in', 'both');     // pin 13
const sideTwoLedGreen = new Gpio(22, 'out');          // pin 15
const systemLedGreen = new Gpio(11, 'out');           // pin 23
const systemLedRed = new Gpio(9, 'out');              // pin 21


// we wrap everything in this top-level IIFE async function so we can await on things during startup
// https://stackoverflow.com/questions/46515764/how-can-i-use-async-await-at-the-top-level
(async () => {
    try {
        // turn all LED's off
        sideOneLedGreen.writeSync(0);
        sideTwoLedGreen.writeSync(0);
        systemLedGreen.writeSync(0);
        systemLedRed.writeSync(0);

        // flash all the led's twice at startup
        await Promise.all([
            ledUtil.blinkLed(sideOneLedGreen, 2),
            ledUtil.blinkLed(sideTwoLedGreen, 2),
            ledUtil.blinkLed(systemLedGreen, 2),
            ledUtil.blinkLed(systemLedRed, 2)
        ]);

        // check health and set system status to green if OK, red if not
        const serverHealth = await pxpClient.getHealth();
        if (serverHealth.body.status === 'healthy') {
            ledUtil.turnLedOn(systemLedGreen);
            ledUtil.turnLedOff(systemLedRed);
        } else {
            ledUtil.turnLedOff(systemLedGreen);
            ledUtil.turnLedOn(systemLedRed);
        }

        // register event handlers
        process.on('SIGINT', cleanupResources());       // runs on exit via ctrl-c
        sideOneButton.watch(buttonOneWatcher);
        sideTwoButton.watch(buttonTwoWatcher);
    } catch (e) {
        console.error(e);
    }
})();


// ----- private -----

function buttonOneWatcher(err, value) {
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }

    // down-press (rising)
    if (value === 1) {
        ledUtil.turnLedOn(sideOneLedGreen);
    }

    // up-press (falling)
    else if (value === 0) {
        ledUtil.turnLedOff(sideOneLedGreen);
        pxpClient
            .postPointScored(TABLE_ID, 1)
            .then((response) => {
                console.dir(response.body);
                ledUtil.blinkLed(sideOneLedGreen, 2);
            })
            .catch((err) => {
                console.error(`Error: ${err}`);
            });
    }
}

function buttonTwoWatcher(err, value) {
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }

    // down-press (rising)
    if (value === 1) {
        ledUtil.turnLedOn(sideTwoLedGreen);
    }

    // up-press (falling)
    else if (value === 0) {
        ledUtil.turnLedOff(sideTwoLedGreen);
        pxpClient
            .postPointScored(TABLE_ID, 2)
            .then((response) => {
                console.dir(response.body);
                ledUtil.blinkLed(sideTwoLedGreen, 2);
            })
            .catch((err) => {
                console.error(`Error: ${err}`);
            });
    }
}

function cleanupResources() {
    return () => {
        sideOneLedGreen.writeSync(0);
        sideOneLedGreen.unexport();
        sideOneButton.unexport();

        systemLedGreen.writeSync(0);
        systemLedGreen.unexport();
        systemLedRed.writeSync(0);
        systemLedRed.unexport();

        sideTwoLedGreen.writeSync(0);
        sideTwoLedGreen.unexport();
        sideTwoButton.unexport();
    };
}