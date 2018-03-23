const zlib = require('zlib');
const data = {
  logGroup:  'ecs-sample-group',
  logStream: 'prefix/container/a1b2c3',
  logEvents: [
    {
      timestamp: new Date().getTime(),
      message:   'something going on',
    },
    {
      timestamp: new Date().getTime(),
      message:   'even more going on',
    },
  ],
};

module.exports = {
  awslogs: {
    data: zlib.gzipSync(new Buffer(JSON.stringify(data), 'ascii')).toString('base64')
  }
};
