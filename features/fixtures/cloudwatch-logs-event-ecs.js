const zlib = require('zlib');
const data = {
  logGroup:  'ecs-sample-group',
  logStream: 'prefix/container/a1b2c3',
  logEvents: [
    {
      timestamp: 1519862400000,
      message:   'something going on',
    },
    {
      timestamp: 1519866000000,
      message:   'even more going on',
    },
  ],
};

module.exports = {
  awslogs: {
    data: zlib.gzipSync(new Buffer(JSON.stringify(data), 'ascii')).toString('base64')
  }
};
