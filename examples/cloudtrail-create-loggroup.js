module.exports = {
  "version":     "0",
  "source":      "aws.logs",
  "region":      "eu-west-1",
  "resources":   [],
  "detail":      {
    "eventVersion":      "1.04",
    "userIdentity":      {
      "type":           "IAMUser",
      "principalId":    "...",
      "arn":            "...",
      "accountId":      "...",
      "accessKeyId":    "...",
      "userName":       "...",
      "sessionContext": {
        "attributes": {
          "mfaAuthenticated": "true",
          "creationDate":     "..."
        }
      },
      "invokedBy":      "signin.amazonaws.com"
    },
    "eventTime":         "...",
    "eventSource":       "logs.amazonaws.com",
    "eventName":         "CreateLogGroup",
    "awsRegion":         "eu-west-1",
    "sourceIPAddress":   "...",
    "userAgent":         "signin.amazonaws.com",
    "requestParameters": {
      "logGroupName": "some-group"
    },
    "responseElements":  null,
    "requestID":         "...",
    "eventID":           "...",
    "eventType":         "AwsApiCall",
    "apiVersion":        "20140328"
  }
};
