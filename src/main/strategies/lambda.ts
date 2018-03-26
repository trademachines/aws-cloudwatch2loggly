import { Injectable } from 'injection-js';
import { EventContext } from '../types';
import { DefaultStrategy } from './default';

@Injectable()
export class LambdaStrategy extends DefaultStrategy {
  ident = 'lambda';

  from(ctx: EventContext) {
    let data = super.from(ctx) as any;

    if (0 === data.message.indexOf('START ') || 0 === data.message.indexOf('REPORT ')) {
      return null;
    }

    data.lambdaFunction = (ctx.group || '').replace('/aws/lambda/', '');
    return data;
  }
}
