const zlib = require('zlib');
const data = {
  messageType:         'DATA_MESSAGE',
  owner:               '608300940987',
  logGroup:            '/aws/lambda/stg-cloudwatch2loggly',
  logStream:           '2018/03/23/[$LATEST]ca09783802074f68b6ee4b3b471a4381',
  subscriptionFilters: [
    'log-event'
  ],
  logEvents:           [
    {
      id:        '33937610457670482952564625782629244863880840766005116928',
      timestamp: 1521815085350,
      message:   'START RequestId: ef3d6688-2ea5-11e8-9480-7dec15b31331 Version: $LATEST\n'
    }
  ]
};

module.exports = {
  awslogs: {
    data: zlib.gzipSync(new Buffer(JSON.stringify(data), 'ascii')).toString('base64')
  }
};
