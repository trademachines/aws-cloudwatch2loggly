import { CloudWatchLogsLogEvent } from 'aws-lambda';

export type EventContext = {
  group: string;
  stream: string;
  event: CloudWatchLogsLogEvent;
};
