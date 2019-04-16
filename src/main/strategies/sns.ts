import { Injectable } from 'injection-js';
import { DefaultStrategy } from './default';
import { EventMessage } from './types';
import { get } from 'lodash';

type SnsFailureMessage = {
  notification: {
    topicArn: string;
  },
  delivery: {
    destination: string;
    providerResponse: string;
  }
};

const topicArnRegex = new RegExp(/^arn:aws:sns:([^:]+):(\d+):(.+)/, 'i');

@Injectable()
export class SnsStrategy extends DefaultStrategy {
  ident = 'sns';

  fromMessage(ctx: EventMessage) {
    const data = super.fromMessage(ctx) as any;
    const message = JSON.parse(data.message) as SnsFailureMessage;

    data.snsTopicArn = get(message, 'notification.topicArn');
    data.snsDeliveryDestination = get(message, 'delivery.destination');
    data.message = get(message, 'delivery.providerResponse');

    const matches = topicArnRegex.exec(data.snsTopicArn);

    if (matches) {
      const [, region, accountId, topicName] = matches;
      data.snsTopicName = topicName;
      data.awsRegion = region;
      data.awsAccountId = accountId;
    }

    return data;
  }
}
