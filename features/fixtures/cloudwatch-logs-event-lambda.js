const zlib = require('zlib');
const data = {
  messageType:         'DATA_MESSAGE',
  owner:               'xxxxxxxxxxxx',
  logGroup:            '/aws/lambda/cucumber',
  logStream:           'a1b2c3',
  subscriptionFilters: [],
  logEvents:           [
    {
      id:        '33937610457670482952564625782629244863880840766005116928',
      timestamp: 1521815085350,
      message:   'START RequestId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx Version: $LATEST\n'
    },
    {
      id:        '33937610457670482952564625782629244863880840766005116928',
      timestamp: 1519862400000,
      message:   `2018-03-01T00:01:00.000Z\txxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\tSomething happened`
    },
    {
      id:        '33937610457670482952564625782629244863880840766005116928',
      timestamp: 1521815085350,
      message:   `REPORT RequestId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\tDuration: 378.53 ms\tBilled Duration: 400 ms Memory Size: 256 MB\tMax Memory Used: 47 MB\n`
    }
  ]
};

module.exports = {
  awslogs: {
    data: zlib.gzipSync(new Buffer(JSON.stringify(data), 'ascii')).toString('base64')
  }
};
