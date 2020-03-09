const needle = require('needle');

module.exports = {
    getHealth
};

const PXP_HOST = '172.16.0.16:3000';

async function getHealth() {
    console.log('getting health');
    return needle('GET', `${PXP_HOST}/health`);
}