import { Injector, Provider } from 'injection-js';
import { HandlerToken } from '../lambda';
import { bootstrap as awsBootstrap, providers as awsProviders } from './aws';
import { CloudwatchService } from './cloudwatch-service';
import { ConfigResolver } from './config-resolver';
import { Configuration } from './configuration';
import { LogglyHandler } from './loggly-handler';
import { LogglySender } from './loggly-sender';
import { bootstrap as strategyBootstrap, providers as strategyProviders } from './strategies';
import {
  bootstrap as subscribeBootstrap, CloudtrailEventHandler, ManualEventHandler, providers as subscribeProviders
} from './subscribe';
import * as tokens from './tokens';

export function providers(): Provider[] {
  return [
    {
      provide:    Configuration,
      deps:       [],
      useFactory: () => new Configuration(JSON.parse(process.env.CONFIG))
    },
    {
      provide:  tokens.LogglyHost,
      useValue: process.env.LOGGLY_HOST
    },
    {
      provide:  tokens.LogglyToken,
      useValue: process.env.LOGGLY_TOKEN
    },
    {
      provide:  HandlerToken,
      useClass: CloudwatchService
    },
    ConfigResolver, LogglyHandler, LogglySender,
    ...subscribeProviders(),
    ...strategyProviders(),
    ...awsProviders()
  ];
}

export function bootstrap(injector: Injector): void {
  subscribeBootstrap(injector);
  strategyBootstrap(injector);
  awsBootstrap(injector);

  let service = injector.get(HandlerToken) as CloudwatchService;

  service
    .setNext(injector.get(ManualEventHandler))
    .setNext(injector.get(CloudtrailEventHandler))
    .setNext(injector.get(LogglyHandler))
  ;
}
