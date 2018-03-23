Feature: Sending logs to Loggly
  As a developer
  I want to do awesome stuff
  So that I can impress others

  Scenario: Send logs successfully
    Given the config is set to
    """
    {
      "groups": [
        {
          "match": "^ecs",
          "behaviour": "ecs",
          "tags": ["production","cloudwatch2loggly"]
        }
      ]
    }
    """
    When I send the file "cloudwatch-logs-event-ecs.js"
    Then a request to Loggly was send at "http://loggly-dummy/bulk/dev-token/tag/production,cloudwatch2loggly" with
    """
    {"timestamp":"2018-03-01T00:00:00.000Z","message":"something going on","logGroup":"ecs-sample-group","logStream":"prefix/container/a1b2c3","dockerTaskId":"a1b2c3","dockerContainer":"container","dockerPrefix":"prefix"}
    {"timestamp":"2018-03-01T01:00:00.000Z","message":"even more going on","logGroup":"ecs-sample-group","logStream":"prefix/container/a1b2c3","dockerTaskId":"a1b2c3","dockerContainer":"container","dockerPrefix":"prefix"}
    """

  Scenario: Cant find behaviour for log group
    Given the config is set to
    """
    {
      "groups": [
        {
          "match": "^foo",
          "behaviour": "ecs",
          "tags": ["production","cloudwatch2loggly"]
        }
      ]
    }
    """
    When I send the file "cloudwatch-logs-event-ecs.js"
    Then an error occured stating "Can't find config for group ecs-sample-group"
    And no request to Loggly was send
