const AWS            = require('aws-sdk');
const config         = require('aws-lambda-config');
const configResolver = require('./config-resolver');
const handler        = require('./handler');
const kms            = new AWS.KMS();

exports.handle = configResolver(config, kms, handler);
