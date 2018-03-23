import { Injector, Provider } from 'injection-js';
import { HandlerToken } from '../lambda';
import { ConfigResolver } from './config-resolver';
import { EventParser } from './event-parser';
import { LogglyHandler } from './loggly-handler';
import { LogglySender } from './loggly-sender';
import * as tokens from './tokens';

export function providers(): Provider[] {
  return [
    {
      provide:    tokens.Config,
      deps:       [],
      useFactory: () => JSON.parse(process.env.CONFIG)
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
      useClass: LogglyHandler
    },
    EventParser, ConfigResolver, LogglySender
  ];
}

export function bootstrap(_injector: Injector): void {
}
