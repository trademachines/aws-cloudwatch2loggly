Feature: Sending logs to Loggly
  As a developer
  I want to forward message from Cloudwatch to Loggly
  So that I can search them easily

  Scenario: Cant find strategy for log group
    Given the config is set to
    """
    {
      "groups": [
        {
          "match": "^foo",
          "strategy": "ecs",
          "tags": ["production","cloudwatch2loggly"]
        }
      ]
    }
    """
    When I send the file "cloudwatch-logs-event-ecs.js"
    Then an error occured stating "Can't find config for group ecs-sample-group"
    And no request to Loggly was send

  Scenario: Send ECS logs successfully
    Given the config is set to
    """
    {
      "groups": [
        {
          "match": "^ecs",
          "strategy": "ecs",
          "tags": ["cucumber","cloudwatch2loggly"]
        }
      ]
    }
    """
    When I send the file "cloudwatch-logs-event-ecs.js"
    Then a request to Loggly was send at "http://loggly-dummy/bulk/dev-token/tag/cucumber,cloudwatch2loggly,container,prefix" with
    """
    {"timestamp":"2018-03-01T00:00:00.000Z","message":"something going on","logGroup":"ecs-sample-group","logStream":"prefix/container/a1b2c3","dockerTaskId":"a1b2c3","dockerContainer":"container","dockerPrefix":"prefix"}
    {"timestamp":"2018-03-01T01:00:00.000Z","message":"even more going on","logGroup":"ecs-sample-group","logStream":"prefix/container/a1b2c3","dockerTaskId":"a1b2c3","dockerContainer":"container","dockerPrefix":"prefix"}
    """

  Scenario: Send Lambda logs successfully
    Given the config is set to
    """
    {
      "groups": [
        {
          "match": "^\\/aws\\/lambda\\/",
          "strategy": "lambda",
          "tags": ["cucumber","lambda","cloudwatch2loggly"]
        }
      ]
    }
    """
    When I send the file "cloudwatch-logs-event-lambda.js"
    Then a request to Loggly was send at "http://loggly-dummy/bulk/dev-token/tag/cucumber,lambda,cloudwatch2loggly" with
    """
    {"timestamp":"2018-03-01T00:01:00.000Z","message":"Something happened","logGroup":"/aws/lambda/cucumber","logStream":"a1b2c3","lambdaRequestId":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx","lambdaFunction":"cucumber"}
    """

  Scenario: Send SNS Failure logs successfully
    Given the config is set to
    """
    {
      "groups": [
        {
          "match": "^sns\\/.+\\/Failure$",
          "strategy": "sns",
          "tags": ["cucumber","sns","cloudwatch2loggly"]
        }
      ]
    }
    """
    When I send the file "cloudwatch-logs-event-sns-failure.js"
    Then a request to Loggly was send at "http://loggly-dummy/bulk/dev-token/tag/cucumber,sns,cloudwatch2loggly" with
    """
    {"timestamp":"2018-03-01T00:00:00.000Z","message":{"ErrorCode":"InvalidParameterValue","ErrorMessage":"Number of message attributes [11] exceeds the maximum allowed [10].","sqsRequestId":"Unrecoverable"},"logGroup":"sns/aws-test-1/123456789012/cucumber/Failure","logStream":"abcdef12-3456-7890-abcd-ef1234567890","snsTopicArn":"arn:aws:sns:aws-test-1:123456789012:cucumber-topic","snsDeliveryDestination":"arn:aws:sqs:aws-test-1:123456789012:dbg-sns-40599u1jui68jlx"}
    """
