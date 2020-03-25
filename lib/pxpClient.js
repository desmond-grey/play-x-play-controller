const needle = require('needle');

module.exports = {
    getHealth,
    getGameStatusForTableId,
    postPointScored
};

const PXP_HOST = 'http://ubuntu@ec2-35-166-35-105.us-west-2.compute.amazonaws.com:3000';

async function getHealth() {
    console.log('getting health');
    return needle(
        'GET',
        `${PXP_HOST}/health`
    );
}

async function getGameStatusForTableId(tableId) {
    const url = `${PXP_HOST}/ping-pong/tables/${tableId}/game`;
    console.log(`Getting URL: ${url}`);
    return needle(
        'GET',
        url,
    )
}

async function postPointScored(tableId, tablePositionThatScored) {
    return needle(
        'POST',
        `${PXP_HOST}/ping-pong/tables/${tableId}/events`,
        {
            eventType: 'POINT_SCORED_ON_TABLE_AT_POSITION',
            tableId: tableId,
            tablePosition: tablePositionThatScored
        },
        { json: true }
    )
}