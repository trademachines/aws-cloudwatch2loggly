import { Context } from 'aws-lambda';
import { CloudWatchLogs } from 'aws-sdk';
import { Injectable } from 'injection-js';
import * as _ from 'lodash';
import { Configuration, Types } from '../configuration';
import { AbstractSubscribeHandler } from './abstract-subscribe-handler';

export type CloudTrailEvent = {
  detail: {
    eventSource: string;
    eventName: string;
    requestParameters: {};
  }
};

@Injectable()
export class CloudtrailEventHandler extends AbstractSubscribeHandler<CloudTrailEvent> {
  private subscriptionWhitelist: RegExp[];

  constructor(cloudWatchLogs: CloudWatchLogs, config: Configuration) {
    super(cloudWatchLogs);
    this.parseConfig(config.getConfig());
    config.on('changed', (ev: Types.ConfigChangedEvent) => this.parseConfig(ev.config));
  }

  async handle(event: CloudTrailEvent, context: Context): Promise<void> {
    if (!this.canHandle(event)) {
      return await this.next.handle(event, context);
    }

    const eventName = _.get(event, 'detail.eventName');
    switch (eventName) {
      case 'CreateLogGroup':
        await this.createSubscription(event.detail.requestParameters['logGroupName'], context);
        break;
      default:
        console.log(`Can not handle eventName ${eventName}`);
        break;
    }
  }

  protected async createSubscription(logGroupName: string, context: Context) {
    if (!this.isWhiteListed(logGroupName)) {
      return;
    }

    return super.createSubscription(logGroupName, context);
  }

  private parseConfig(config: Types.Config) {
    this.subscriptionWhitelist = config.subscription.whitelist.map(w => new RegExp(w, 'i'));
  }

  private isWhiteListed(logGroupName: string) {
    return _.some(this.subscriptionWhitelist, r => r.test(logGroupName));
  }

  private canHandle(event: CloudTrailEvent) {
    let source = _.get(event, 'detail.eventSource');

    return 'logs.amazonaws.com' === source;
  }
}
