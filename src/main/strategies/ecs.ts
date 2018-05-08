import { Injectable } from 'injection-js';
import { DefaultStrategy } from './default';
import { EventContext, EventMessage } from './types';

@Injectable()
export class EcsStrategy extends DefaultStrategy {
  ident = 'ecs';

  fromMessage(message: EventMessage) {
    let data = super.fromMessage(message) as any;

    if (message.stream.includes('/')) {
      const parts = message.stream.split('/');

      data.dockerTaskId    = parts.pop();
      data.dockerContainer = parts.pop();
      data.dockerPrefix    = parts.join('/');
    }

    return data;
  }

  fromContext(context: EventContext) {
    if (context.stream.includes('/')) {
      const parts = context.stream.split('/');
      parts.pop();

      return {
        tags: [
          parts.pop(),
          parts.join('/')
        ]
      };
    }

    return {
      tags: []
    };
  }
}
