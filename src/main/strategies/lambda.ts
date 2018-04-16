import { Injectable } from 'injection-js';
import { DefaultStrategy } from './default';
import { EventContext } from './types';

const messageRegex = new RegExp(/^([^\t]+)\t(\w{8}\-\w{4}\-\w{4}\-\w{4}\-\w{12})\t(.+)$/, 'i');

@Injectable()
export class LambdaStrategy extends DefaultStrategy {
  ident = 'lambda';

  from(ctx: EventContext) {
    let data = super.from(ctx) as any;

    if (0 === data.message.indexOf('START ')
      || 0 === data.message.indexOf('END ')
      || 0 === data.message.indexOf('REPORT ')) {
      return null;
    }

    let matched = messageRegex.exec(data.message);
    if (matched) {
      let [, timestamp, requestId, message,] = matched;

      data.timestamp       = timestamp;
      data.lambdaRequestId = requestId;
      data.message         = message;
    }

    data.lambdaFunction = (ctx.group || '').replace('/aws/lambda/', '');

    return data;
  }
}
