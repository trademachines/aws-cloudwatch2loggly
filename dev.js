require('ts-node/register');
const handler = require('./src/index');

module.exports.handler = handler.handle;
