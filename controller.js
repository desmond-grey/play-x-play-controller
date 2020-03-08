const Gpio = require('onoff').Gpio;

const sideOneButton  = new Gpio(26, 'in', 'both');    // pin 37  todo: maybe don't want to use both
const sideOneLedGreen = new Gpio(19, 'out');                // pin 35

const systemLedGreen = new Gpio(11, 'out');                 // pin 23
const systemLedRed = new Gpio(9, 'out');                   // pin 21

const sideTwoButton  = new Gpio(27, 'in', 'both');    // pin 13   todo: maybe don't want to use both
const sideTwoLedGreen = new Gpio(22, 'out');                // pin 15


// todo: flash all the led's at startup

sideOneButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(`button press detected, setting LED to ${value}`);
    sideOneLedGreen.writeSync(value); //turn LED on or off depending on the button state (0 or 1)

    // todo: temp
    systemLedGreen.writeSync(value); //turn LED on or off depending on the button state (0 or 1)
    systemLedRed.writeSync(value); //turn LED on or off depending on the button state (0 or 1)
});

sideTwoButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(`button press detected, setting LED to ${value}`);
    sideTwoLedGreen.writeSync(value); //turn LED on or off depending on the button state (0 or 1)

    // todo: temp
    systemLedGreen.writeSync(value); //turn LED on or off depending on the button state (0 or 1)
    systemLedRed.writeSync(value); //turn LED on or off depending on the button state (0 or 1)
});


// runs on exit via ctrl-c
process.on('SIGINT', () => {
    sideOneLedGreen.writeSync(0); sideOneLedGreen.unexport();
    sideOneButton.unexport();

    systemLedGreen.writeSync(0);  systemLedGreen.unexport();
    systemLedRed.writeSync(0);  systemLedRed.unexport();

    sideTwoLedGreen.writeSync(0);  sideTwoLedGreen.unexport();
    sideTwoButton.unexport();
});