import { Context } from 'aws-lambda';
import { Injectable } from 'injection-js';
import { Handler } from '../lambda';
import { AbstractChainItem } from './chain';
import { Event } from './loggly-handler';

@Injectable()
export class CloudwatchService extends AbstractChainItem<any> implements Handler<Event> {
  async handle(event: any, context: Context): Promise<void> {
    await this.next.handle(event, context);
  }
}
