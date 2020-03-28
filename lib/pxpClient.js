const
    needle = require('needle'),
    config = require('../config');

module.exports = {
    getHealth,
    getGameStatusForTableId,
    postPointScored
};


async function getHealth() {
    console.log('getting health');
    return needle(
        'GET',
        `${config.PXP_HOST}/health`
    );
}

async function getGameStatusForTableId(tableId) {
    const url = `${config.PXP_HOST}/ping-pong/tables/${tableId}/game`;
    console.log(`Getting URL: ${url}`);
    return needle(
        'GET',
        url,
    )
}

async function postPointScored(tableId, tablePositionThatScored) {
    return needle(
        'POST',
        `${config.PXP_HOST}/ping-pong/tables/${tableId}/events`,
        {
            eventType: 'POINT_SCORED_ON_TABLE_AT_POSITION',
            tableId: tableId,
            tablePosition: tablePositionThatScored
        },
        { json: true }
    )
}