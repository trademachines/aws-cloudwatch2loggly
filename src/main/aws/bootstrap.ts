import { CloudWatchLogs } from 'aws-sdk';
import { Injector, Provider } from 'injection-js';

export function providers(): Provider[] {
  return [
    {
      provide:    'aws.cloudwatch.logs.options',
      deps:       [],
      useFactory: () => {
        let options = {} as any;

        if (process.env.AWS_CLOUDWATCH_LOGS_ENDPOINT) {
          options.endpoint        = process.env.AWS_CLOUDWATCH_LOGS_ENDPOINT;
          options.accessKeyId     = 'abc';
          options.secretAccessKey = 'def';
        }

        return options;
      }
    },
    {
      provide:    CloudWatchLogs,
      deps:       ['aws.cloudwatch.logs.options'],
      useFactory: options => new CloudWatchLogs(options)
    }
  ];
}

export function bootstrap(_injector: Injector): void {
}
