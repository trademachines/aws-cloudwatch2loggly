Feature: Subscribe to CloudWatch log groups
  As a developer
  I want the service to be able to subscribe to log groups
  So that I can automate stuff

  Background:
    Given the Lambda context is set to
    """
    {
      "functionName":       "test-cloudwatch2loggly",
      "invokedFunctionArn": "arn:aws:lambda:eu-test-1:xxxxxxxxxxxx:function:test-cloudwatch2loggly"
    }
    """
    And I have a log group "some-random-log-group"

  Scenario: Subscribe to newly created log groups automatically
    Given the config is set to
    """
    {
      "subscription": {
        "whitelist": [
          ".*"
        ]
      }
    }
    """
    When I send the file "cloudtrail-create-loggroup.js"
    Then I have a subscription filter for log group "some-random-log-group" with name "test-cloudwatch2loggly" pointing to "arn:aws:lambda:eu-test-1:xxxxxxxxxxxx:function:test-cloudwatch2loggly"

  Scenario: Don't subscribe to log groups that are not whitelisted
    Given the config is set to
    """
    {
      "subscription": {
        "whitelist": [
          "only-specific-log-group"
        ]
      }
    }
    """
    When I send the file "cloudtrail-create-loggroup.js"
    Then I don't have a subscription filter for log group "some-random-log-group"

  Scenario: Subscribe to existing log groups via manually crafted event (ignoring whitelisting)
    Given the config is set to
    """
    {
      "subscription": {
        "whitelist": [
          "only-specific-log-group"
        ]
      }
    }
    """
    When I send the file "manually-subscribe-to-loggroup.js"
    Then I have a subscription filter for log group "some-random-log-group" with name "test-cloudwatch2loggly" pointing to "arn:aws:lambda:eu-test-1:xxxxxxxxxxxx:function:test-cloudwatch2loggly"
