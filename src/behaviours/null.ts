import { CloudWatchLogsLogEvent } from 'aws-lambda';
import { Injectable } from 'injection-js';
import { Behaviour } from './types';

@Injectable()
export class NullBehaviour implements Behaviour {
  getData(_group: string, _stream: string, _rawEvent: CloudWatchLogsLogEvent) {
    return {};
  }
}
