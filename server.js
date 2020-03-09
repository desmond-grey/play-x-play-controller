const
    Gpio = require('onoff').Gpio,
    ledUtil = require('./lib/ledUtil'),
    pxpClient = require('./lib/pxpClient');

const sideOneButton = new Gpio(26, 'in', 'both');    // pin 37  todo: maybe don't want to use both
const sideOneLedGreen = new Gpio(19, 'out');          // pin 35
const sideTwoButton = new Gpio(27, 'in', 'both');    // pin 13   todo: maybe don't want to use both
const sideTwoLedGreen = new Gpio(22, 'out');          // pin 15
const systemLedGreen = new Gpio(11, 'out');           // pin 23
const systemLedRed = new Gpio(9, 'out');              // pin 21

// register event handlers
process.on('SIGINT', cleanupResources());       // runs on exit via ctrl-c
sideOneButton.watch(buttonOneWatcher());
sideTwoButton.watch(buttonTwoWatcher());

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
        const health = await Promise.all([
            ledUtil.blinkLed(sideOneLedGreen, 2),
            ledUtil.blinkLed(sideTwoLedGreen, 2),
            ledUtil.blinkLed(systemLedGreen, 2),
            ledUtil.blinkLed(systemLedRed, 2)
        ]);
        console.log(`health: ${JSON.stringify(health)}`);

        // check health and set system status to green if OK, red if not
        pxpClient
            .getHealth()
            .then(() => {
                ledUtil.turnLedOn(systemLedGreen);
                ledUtil.turnLedOff(systemLedRed);
            })
            .catch(() => {
                ledUtil.turnLedOff(systemLedGreen);
                ledUtil.turnLedOn(systemLedRed);
            });

    } catch (e) {
        console.error(e);
    }
})();


// ----- private -----

function buttonOneWatcher() {
    return function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
        if (err) { //if an error
            console.error('There was an error', err); //output error message to console
            return;
        }
        console.log(`button press detected, setting LED to ${value}`);
        ledUtil.toggleLedState(sideOneLedGreen);
    };
}

function buttonTwoWatcher() {
    return function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
        if (err) { //if an error
            console.error('There was an error', err); //output error message to console
            return;
        }
        console.log(`button press detected, setting LED to ${value}`);
        ledUtil.toggleLedState(sideTwoLedGreen);
    };
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