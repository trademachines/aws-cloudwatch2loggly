import { Context } from 'aws-lambda';
import * as _ from 'lodash';
import { AbstractSubscribeHandler } from './abstract-subscribe-handler';

export type ManualAction = 'subscribe' | string;

export type ManualEvent = {
  source: 'manual';
  action: ManualAction;
  parameters?: { [key: string]: any };
};

export class ManualEventHandler extends AbstractSubscribeHandler<ManualEvent> {
  async handle(event: ManualEvent, context: Context): Promise<void> {
    if (!this.canHandle(event)) {
      return await this.next.handle(event, context);
    }

    const action = _.get(event, 'action');
    switch (action) {
      case 'subscribe':
        await this.createSubscription(event.parameters['logGroupName'], context);
        break;
      default:
        console.log(`Can not handle manual action ${action}`);
        break;
    }
  }

  private canHandle(event: ManualEvent) {
    let source = _.get(event, 'source');

    return 'manual' === source;
  }
}
