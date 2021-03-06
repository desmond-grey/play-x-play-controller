const
    Gpio = require('onoff').Gpio,
    config = require('config'),
    ledUtil = require('./lib/ledUtil'),
    ledNames = ledUtil.ledNames,
    pxpClient = require('./lib/pxpClient');

const TABLE_ID = 'prototype_controller';

const sideOneButton = new Gpio(26, 'in', 'both', {debounceTimeout: 10});     // pin 37
const sideTwoButton = new Gpio(27, 'in', 'both', {debounceTimeout: 10});     // pin 13


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
        setTimeout(hasActiveGame.bind(null, TABLE_ID), config.get('POLLING_INTERVAL_MILLIS'));
    } else {
        await ledUtil.blink(ledNames.SYSTEM_RED, 1);
        setTimeout(canEstablishConnection, config.get('POLLING_INTERVAL_MILLIS'));
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
                    console.log('');
                    ledUtil.turnAllOff();
                    ledUtil.turnOn(ledNames.SYSTEM_GREEN);
                    ledUtil.turnOn(ledNames.SIDE_ONE_GREEN);
                    ledUtil.turnOn(ledNames.SIDE_TWO_GREEN);

                    sideOneButton.watch(buttonWatcher.bind({ledName: ledNames.SIDE_ONE_GREEN, tablePosition: 1}));
                    sideTwoButton.watch(buttonWatcher.bind({ledName: ledNames.SIDE_TWO_GREEN, tablePosition: 2}));

                    resolve(true);
                } else if(! gameId && response.statusCode === 404) {
                    console.log('- no active game found');
                    console.log('');
                    await Promise.all([
                        ledUtil.blink(ledNames.SYSTEM_GREEN, 2),
                        ledUtil.blink(ledNames.SIDE_ONE_GREEN, 2),
                        ledUtil.blink(ledNames.SIDE_TWO_GREEN, 2)
                    ]);

                    setTimeout(hasActiveGame.bind(null, TABLE_ID), config.get('POLLING_INTERVAL_MILLIS'));
                    resolve(false)
                }
            })
            .catch(err => {
                console.log(`Error getting gameStatus for tableId: ${tableId}.  Error: ${err}`);
                setTimeout(isConnectionHealthyFunction, config.get('POLLING_INTERVAL_MILLIS'));
                reject(err);
            });
    })
}

// turns the getHealth call into a true, false or error.
async function isConnectionHealthyFunction() {
    return new Promise((resolve) => {
        pxpClient
            .getHealth()
            .then(response => {
                resolve(response.body.status === 'healthy');
            })
            .catch(err => {
                console.log(`Error: ${err}`);
                resolve(false);
            });
    })
}

function buttonWatcher(err, value) {
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }

    // down-press (rising)
    if (value === 1) {
        // noinspection JSUnresolvedVariable
        ledUtil.turnOff(this.ledName);
    }

    // up-press (falling)
    else if (value === 0) {
        // noinspection JSUnresolvedVariable
        ledUtil.turnOn(this.ledName);

        // noinspection JSUnresolvedVariable
        pxpClient
            .postPointScored(TABLE_ID, this.tablePosition)
            .then((response) => {
                if(response.status === 404) {
                    console.log('No Active Game');
                    setTimeout(activeGameHasEnded, 0);      // todo: is the setTimeout necessary?
                } else if(response.body.gameStatus ==='COMPLETE') {
                    console.log('Point scored successfully.  Game Complete.  Final game status:');
                    console.log(JSON.stringify(response.body, null, 2));
                    console.log('');

                    setTimeout(activeGameHasEnded, 0);      // todo: is the setTimeout necessary?
                } else {
                    console.log('Point scored successfully.  Game status:');
                    console.log(JSON.stringify(response.body, null, 2));
                    console.log('');

                    // noinspection JSUnresolvedVariable
                    ledUtil.blinkFast(this.ledName, 2);
                }
            })
            .catch((err) => {
                console.error(`Error: ${err}`);
                setTimeout(activeGameHasEnded, 0);      // todo: is the setTimeout necessary?
            });
    }
}

async function activeGameHasEnded() {
    sideOneButton.unwatch();
    sideTwoButton.unwatch();

    ledUtil.turnOff(ledNames.SIDE_ONE_GREEN);
    ledUtil.turnOff(ledNames.SIDE_TWO_GREEN);
    ledUtil.turnOff(ledNames.SYSTEM_GREEN);

    setTimeout(hasActiveGame, 0);
}

function cleanupResources() {
    return () => {
        ledUtil.cleanupResources();
        sideOneButton.unexport();
        sideTwoButton.unexport();
    };
}
