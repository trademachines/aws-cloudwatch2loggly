import { Injectable } from 'injection-js';
import { DefaultStrategy } from './default';
import { EventMessage } from './types';
import { get } from 'lodash';
import { parseJson } from '../../utils';

type SnsFailureMessage = {
  notification: {
    topicArn: string;
  },
  delivery: {
    destination: string;
    providerResponse: string;
  }
};

@Injectable()
export class SnsStrategy extends DefaultStrategy {
  ident = 'sns';

  fromMessage(ctx: EventMessage) {
    const data = super.fromMessage(ctx) as any;
    const message = JSON.parse(data.message) as SnsFailureMessage;
    const response = get(message, 'delivery.providerResponse');

    data.snsTopicArn = get(message, 'notification.topicArn');
    data.snsDeliveryDestination = get(message, 'delivery.destination');
    data.message = parseJson(response);

    return data;
  }
}
