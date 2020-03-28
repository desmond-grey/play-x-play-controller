const
    Gpio = require('onoff').Gpio,
    ledUtil = require('./lib/ledUtil'),
    ledNames = ledUtil.ledNames,
    pxpClient = require('./lib/pxpClient');

const TABLE_ID = 'prototype_controller';

const sideOneButton = new Gpio(26, 'in', 'both');     // pin 37
const sideTwoButton = new Gpio(27, 'in', 'both');     // pin 13

const POLLING_INTERVAL_MILLIS = 1000;       // todo: centralize intervals.  put into config

// register event handlers
process.on('SIGINT', cleanupResources());       // runs on exit via ctrl-c

// we wrap everything in this top-level IIFE async function so we can await on things during startup
// https://stackoverflow.com/questions/46515764/how-can-i-use-async-await-at-the-top-level
(async () => {
    try {
        ledUtil.turnAllOff();
        await ledUtil.blinkAll(2);
        await canEstablishConnection();
    } catch (e) {
        console.error(e);
    }
})();


// ----- private -----

async function canEstablishConnection() {
    console.log("Checking health of connection");
    const isConnectionHealthy = await isConnectionHealthyFunction();
    if(isConnectionHealthy) {
        await ledUtil.blink(    ledNames.SYSTEM_GREEN, 1);
        setTimeout(hasActiveGame.bind(null, TABLE_ID), 1000);
    } else {
        await ledUtil.blink(ledNames.SYSTEM_RED, 1);
        setTimeout(isConnectionHealthyFunction, 1000);
    }
}

// turns the getGameStatusForTableId call into a true, false or error.
async function hasActiveGame(tableId) {
    console.log('');
    console.log(`Checking for active game on table: ${TABLE_ID}`);
    return new Promise((resolve, reject) => {
        pxpClient
            .getGameStatusForTableId(tableId)
            .then(async (response) => {
                const gameId = response.body.gameId;
                if(gameId && response.statusCode === 200) {
                    console.log(`- active game found.  gameId: ${gameId}`);
                    ledUtil.turnAllOff();
                    ledUtil.turnOn(ledNames.SYSTEM_GREEN);
                    ledUtil.turnOn(ledNames.SIDE_ONE_GREEN);
                    ledUtil.turnOn(ledNames.SIDE_TWO_GREEN);

                    sideOneButton.watch(buttonOneWatcher);
                    sideTwoButton.watch(buttonTwoWatcher);

                    resolve(true);
                } else if(! gameId && response.statusCode === 404) {
                    console.log('- no active game found');
                    await Promise.all([
                        ledUtil.blink(ledNames.SYSTEM_GREEN, 2),
                        ledUtil.blink(ledNames.SIDE_ONE_GREEN, 2),
                        ledUtil.blink(ledNames.SIDE_TWO_GREEN, 2)
                    ]);

                    setTimeout(hasActiveGame.bind(null, TABLE_ID), 1000);
                    resolve(false)
                }
            })
            .catch(err => {
                console.log(`Error getting gameStatus for tableId: ${tableId}.  Error: ${err}`);
                setTimeout(isConnectionHealthyFunction, 1000);
                reject(err);
            });
    })
}

// turns the getHealth call into a true, false or error.
async function isConnectionHealthyFunction() {
    return new Promise((resolve, reject) => {
        pxpClient
            .getHealth()
            .then(response => {
                resolve(response.body.status === 'healthy');
            })
            .catch(err => {
                console.log(`Error: ${err}`);
                reject(err);
            });
    })
}

function buttonOneWatcher(err, value) {
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }

    // down-press (rising)
    if (value === 1) {
        ledUtil.turnOn(ledNames.SIDE_ONE_GREEN);
    }

    // up-press (falling)
    else if (value === 0) {
        ledUtil.turnOff(ledNames.SIDE_ONE_GREEN);
        pxpClient
            .postPointScored(TABLE_ID, 1)
            .then((response) => {
                console.log(JSON.stringify(response.body, null, 2));
                ledUtil.blink(ledNames.SIDE_ONE_GREEN, 2);
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
        ledUtil.turnOn(ledNames.SIDE_TWO_GREEN);
    }

    // up-press (falling)
    else if (value === 0) {
        ledUtil.turnOff(ledNames.SIDE_TWO_GREEN);
        pxpClient
            .postPointScored(TABLE_ID, 2)
            .then((response) => {
                console.log(JSON.stringify(response.body, null, 2));
                ledUtil.blink(ledNames.SIDE_TWO_GREEN, 2);
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
