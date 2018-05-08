import { Injectable } from 'injection-js';
import { get } from 'lodash';
import { EventContext, EventMessage, Strategy } from './types';

export const DefaultStrategyIdentifier = 'default';

@Injectable()
export class DefaultStrategy implements Strategy {
  ident = DefaultStrategyIdentifier;

  fromMessage(message: EventMessage) {
    let text      = get(message.event, 'message', '');
    let timestamp = get(message.event, 'timestamp');
    let date      = timestamp ? new Date(timestamp) : new Date();

    return {
      timestamp: date.toISOString(),
      message:   text.trim(),
      logGroup:  message.group,
      logStream: message.stream
    };
  }

  fromContext(_context: EventContext): any {
    return {};
  }
}
