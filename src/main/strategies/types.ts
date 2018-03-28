import { CloudWatchLogsLogEvent } from 'aws-lambda';

export type EventContext = {
  group: string;
  stream: string;
  event: CloudWatchLogsLogEvent;
};

export type StrategyIdentifier = string;

export interface Strategy {
  ident: StrategyIdentifier;

  from(ctx: EventContext): any;
}
