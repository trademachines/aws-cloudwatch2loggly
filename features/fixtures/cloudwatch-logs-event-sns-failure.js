const zlib = require('zlib');
const data = {
  messageType:         'DATA_MESSAGE',
  owner:               '123456789012',
  logGroup:            'sns/aws-test-1/123456789012/cucumber/Failure',
  logStream:           'abcdef12-3456-7890-abcd-ef1234567890',
  subscriptionFilters: [],
  logEvents:           [
    {
      id:        '33937610457670482952564625782629244863880840766005116928',
      timestamp: 1519862400000,
      message:   JSON.stringify({
        notification: {
          topicArn: 'arn:aws:sns:aws-test-1:123456789012:cucumber-topic',
        },
        delivery:     {
          destination:      'arn:aws:sqs:aws-test-1:123456789012:dbg-sns-40599u1jui68jlx',
          providerResponse: JSON.stringify({
            ErrorCode:    'InvalidParameterValue',
            ErrorMessage: 'Number of message attributes [11] exceeds the maximum allowed [10].',
            sqsRequestId: 'Unrecoverable'
          }),
        },
        status:       'FAILURE'
      })
    }
  ]
};

module.exports = {
  awslogs: {
    data: zlib.gzipSync(new Buffer(JSON.stringify(data), 'ascii')).toString('base64')
  }
};
