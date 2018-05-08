import { Injectable } from 'injection-js';
import { DefaultStrategy } from './default';
import { EventMessage } from './types';

const messageRegex = new RegExp(/^([^\t]+)\t(\w{8}\-\w{4}\-\w{4}\-\w{4}\-\w{12})\t(.+)$/, 'i');

@Injectable()
export class LambdaStrategy extends DefaultStrategy {
  ident = 'lambda';

  fromMessage(ctx: EventMessage) {
    let data = super.fromMessage(ctx) as any;

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
