import { CloudWatchLogsLogEvent } from 'aws-lambda';

export type EventContext = {
  group: string;
  stream: string;
};

export type EventMessage = EventContext & {
  event: CloudWatchLogsLogEvent;
};

export type StrategyIdentifier = string;

export interface Strategy {
  ident: StrategyIdentifier;

  fromContext(context: EventContext): any;

  fromMessage(message: EventMessage): any;
}
