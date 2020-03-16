const
    Gpio = require('onoff').Gpio,
    ledUtil = require('./lib/ledUtil'),
    pxpClient = require('./lib/pxpClient');

const TABLE_ID = 'prototype_controller';

const sideOneButton = new Gpio(26, 'in', 'both');     // pin 37
const sideTwoButton = new Gpio(27, 'in', 'both');     // pin 13

const POLLING_INTERVAL_MILLIS = 1000;


// we wrap everything in this top-level IIFE async function so we can await on things during startup
// https://stackoverflow.com/questions/46515764/how-can-i-use-async-await-at-the-top-level
(async () => {
    try {
        ledUtil.turnAllOff();
        await ledUtil.blinkAll(2);

        // poll for health
        setInterval(checkServerHealth, POLLING_INTERVAL_MILLIS);

        // register event handlers
        process.on('SIGINT', cleanupResources());       // runs on exit via ctrl-c
        sideOneButton.watch(buttonOneWatcher);
        sideTwoButton.watch(buttonTwoWatcher);
    } catch (e) {
        console.error(e);
    }
})();


// ----- private -----

function checkServerHealth() {
    pxpClient
        .getHealth()
        .then(response => {
            if(response.body.status === 'healthy') {
                ledUtil.turnOff('SYSTEM_RED');
                ledUtil.blink('SYSTEM_GREEN');
            } else {
                ledUtil.turnOff('SYSTEM_GREEN');
                ledUtil.blink('SYSTEM_RED');
            }
        })
        .catch(err => {
            console.log(`Error: ${err}`);
            ledUtil.turnOff('SYSTEM_GREEN');
            ledUtil.blink('SYSTEM_RED');
        });
}

function buttonOneWatcher(err, value) {
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }

    // down-press (rising)
    if (value === 1) {
        ledUtil.turnOn('SIDE_ONE_GREEN');
    }

    // up-press (falling)
    else if (value === 0) {
        ledUtil.turnLedOff(sideOneLedGreen);
        pxpClient
            .postPointScored(TABLE_ID, 1)
            .then((response) => {
                console.log(JSON.stringify(response.body, null, 2));
                ledUtil.blink('SIDE_ONE_GREEN', 2);
            })
            .catch((err) => {
                // todo: some errors are not handled here but are special kinds of body responses.  handle those
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
        ledUtil.turnOn('SIDE_TWO_GREEN');
    }

    // up-press (falling)
    else if (value === 0) {
        ledUtil.turnLedOff(sideTwoLedGreen);
        pxpClient
            .postPointScored(TABLE_ID, 2)
            .then((response) => {
                console.log(JSON.stringify(response.body, null, 2));
                ledUtil.blink('SIDE_TWO_GREEN', 2);
            })
            .catch((err) => {
                // todo: some errors are not handled here but are special kinds of body responses.  handle those
                console.error(`Error: ${err}`);
            });
    }
}

function cleanupResources() {
    return () => {
        ledUtil.cleanupResources();
        sideOneButton.unexport();
        sideTwoButton.unexport();
    };
}
