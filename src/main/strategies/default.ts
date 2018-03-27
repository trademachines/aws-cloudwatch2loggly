import { Injectable } from 'injection-js';
import { get } from 'lodash';
import { EventContext, Strategy } from './types';

export const DefaultStrategyIdentifier = 'default';

@Injectable()
export class DefaultStrategy implements Strategy {
  ident = DefaultStrategyIdentifier;

  from(ctx: EventContext) {
    let msg       = get(ctx.event, 'message', '');
    let timestamp = get(ctx.event, 'timestamp');
    let date      = timestamp ? new Date(timestamp) : new Date();

    return {
      timestamp: date.toISOString(),
      message:   msg.trim(),
      logGroup:  ctx.group,
      logStream: ctx.stream,
    };
  }
}
