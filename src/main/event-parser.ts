import { CloudWatchLogsLogEvent } from 'aws-lambda';
import { Injectable } from 'injection-js';

@Injectable()
export class EventParser {
  getData(group: string, stream: string, rawEvent: CloudWatchLogsLogEvent) {
    return {
      timestamp: new Date(rawEvent.timestamp).toISOString(),
      message:   rawEvent.message.trim(),
      logGroup:  group,
      logStream: stream,
    };
  }
}
