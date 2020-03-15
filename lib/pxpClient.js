const needle = require('needle');

module.exports = {
    getHealth,
    postPointScored
};

const PXP_HOST = 'ubuntu@ec2-35-166-35-105.us-west-2.compute.amazonaws.com:3000';

async function getHealth() {
    console.log('getting health');
    return needle(
        'GET',
        `${PXP_HOST}/health`
    );
}

async function postPointScored(tableId, tablePositionThatScored) {
    return needle(
        'POST',
        `${PXP_HOST}/ping-pong/tables/${tableId}/events`,
        {
            eventType: 'POINT_SCORED_AT_TABLE_POSITION',
            tableId: tableId,
            tablePosition: tablePositionThatScored
        },
        { json: true }
    )
}