const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
const LED = new Gpio(4, 'out'); //use GPIO pin 4 as output

LED.writeSync(value); //turn LED on or off depending on the button state (0 or 1)

function unexportOnClose() { //function to run when exiting program
    LED.writeSync(0); // Turn LED off
    LED.unexport(); // Unexport LED GPIO to free resources
}

process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+c