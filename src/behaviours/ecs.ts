import { CloudWatchLogsLogEvent } from 'aws-lambda';
import { Injectable } from 'injection-js';
import { Behaviour } from './types';

@Injectable()
export class EcsBehaviour implements Behaviour {
  getData(_group: string, stream: string, _rawEvent: CloudWatchLogsLogEvent) {
    let data = {} as any;

    if (stream.includes('/')) {
      const parts = stream.split('/');

      data.dockerTaskId    = parts.pop();
      data.dockerContainer = parts.pop();
      data.dockerPrefix    = parts.join('/');
    }

    return data;
  }
}
