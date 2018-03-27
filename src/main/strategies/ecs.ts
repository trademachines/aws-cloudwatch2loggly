import { Injectable } from 'injection-js';
import { DefaultStrategy } from './default';
import { EventContext } from './types';

@Injectable()
export class EcsStrategy extends DefaultStrategy {
  ident = 'ecs';

  from(ctx: EventContext) {
    let data = super.from(ctx) as any;

    if (ctx.stream.includes('/')) {
      const parts = ctx.stream.split('/');

      data.dockerTaskId    = parts.pop();
      data.dockerContainer = parts.pop();
      data.dockerPrefix    = parts.join('/');
    }

    return data;
  }
}
