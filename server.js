const Gpio = require('onoff').Gpio;

const BLINK_INTERVAL_MILLIS = 500;

const sideOneButton  = new Gpio(26, 'in', 'both');    // pin 37  todo: maybe don't want to use both
const sideOneLedGreen = new Gpio(19, 'out');          // pin 35
const sideTwoButton  = new Gpio(27, 'in', 'both');    // pin 13   todo: maybe don't want to use both
const sideTwoLedGreen = new Gpio(22, 'out');          // pin 15
const systemLedGreen = new Gpio(11, 'out');           // pin 23
const systemLedRed = new Gpio(9, 'out');              // pin 21

// register event handlers
process.on('SIGINT', cleanupResources());       // runs on exit via ctrl-c
sideOneButton.watch(buttonOneWatcher());
sideTwoButton.watch(buttonTwoWatcher());

// turn all LED's off
sideOneLedGreen.writeSync(0);
sideTwoLedGreen.writeSync(0);
systemLedGreen.writeSync(0);
systemLedRed.writeSync(0);

// flash all the led's at startup twice
blinkLed(sideOneLedGreen, 2);
blinkLed(sideTwoLedGreen, 2);
blinkLed(systemLedGreen, 2);
blinkLed(systemLedRed, 2);




// ----- private -----

function buttonOneWatcher() {
    return function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
        if (err) { //if an error
            console.error('There was an error', err); //output error message to console
            return;
        }
        console.log(`button press detected, setting LED to ${value}`);
        toggleLedState(sideOneLedGreen);
    };
}

function buttonTwoWatcher() {
    return function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
        if (err) { //if an error
            console.error('There was an error', err); //output error message to console
            return;
        }
        console.log(`button press detected, setting LED to ${value}`);
        toggleLedState(sideTwoLedGreen);
    };
}

function blinkLed(led, numBlinks) {
    let numToggles = numBlinks * 2;     // two toggles needed for each blink

    let toggleCount = 0;
    let intervalID = setInterval(function () {
        toggleLedState(led);
        toggleCount ++;

        if (toggleCount === numToggles) {
            clearInterval(intervalID);
        }
    }, BLINK_INTERVAL_MILLIS);
}

function toggleLedState(led) {
    if (led.readSync() === 0) {
        led.writeSync(1);
    } else {
        led.writeSync(0);
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