import { Context } from 'aws-lambda';
import { InjectionToken } from 'injection-js';

export const HandlerToken = new InjectionToken<Handler<any>>('handler for lambda events');

export interface Handler<T> {
  handle(event: T, context?: Context): Promise<any>;
}
