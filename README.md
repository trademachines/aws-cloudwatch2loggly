# AWS Cloudwatch2Loggly

## Intention
Inspired by [cloudwatch2loggly](https://github.com/varshneyjayant/cloudwatch2loggly) we developed
this tool to stream from multiple input sources, enrich the log information and forward it to
multiple output sources without the necessity to change to implementation itself.

## Configuration
Is done via retrieving the configuration file from S3 by utilising [the aws-lambda-config package](https://www.npmjs.com/package/aws-lambda-config).
On top of that the config is cached for the lifetime of the Lambda function and you can insert a KMS
encrypted value for the token. This will be decrypted in-memory during runtime. 

For the code to work properly you need 3 keys in your configuration file. ``host`` is the endpoint to
send the data to and it should default to the value below. ``tags`` are the comma separated values that
your log entries will be tagged with. And last but not least the ``token`` that is very private key
for communicating with Loggly.

### Configuration example
```
{
  "host": "logs-01.loggly.com",
  "tags": "production,cloudwatch2loggly",
  "token": "ENC[KMS,...]",
  "__groupMap": {
    "different-log-group-name": {
      "tags": "staging,cloudwatch2loggly"
    }
  }
}
```

## Provisioning resources
We use [Terraform](https://www.terraform.io/) for setting up the necessary resources at AWS. If
you do it differently the drill goes like this:

* Create a role that has either the ``CloudWatchFullAccess`` and ``AmazonS3ReadOnlyAccess`` policies attached or create more fine grained policies for your specific needs.
* Upload your configuration file (see example above) to an appropriate S3 bucket according to [the aws-lambda-config package](https://www.npmjs.com/package/aws-lambda-config).
* If you care about security:
  * Encrypt the token with ``aws kms encrypt --key-id alias/<your KMS key alias> --plaintext "<your loggly customer token>" --query CiphertextBlob --output text`` and wrap the response as it can be seen in the configuration example. 
  * Enable the IAM role used for the Lambda to use that key.
* Then Create a Lambda function, point the handler to ``src/index.handle``, use the role that you just created and
  add the subscription for a Cloudwatch Log Group

## Deployment
The Lambda can either be deployed manually by zipping the necessary code with

    zip -r aws-cloudwatch2loggly.zip index.js src/ node_modules/ > /dev/null

(don't forget to remove development dependencies) and uploading it to AWS or you utilise things
like Travis CI to do it for you.
