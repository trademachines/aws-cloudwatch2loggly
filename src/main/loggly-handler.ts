import { CloudWatchLogsDecodedData, CloudWatchLogsEvent } from 'aws-lambda';
import { Inject, Injectable } from 'injection-js';
import * as _ from 'lodash';
import * as zlib from 'zlib';
import { Behaviour } from '../behaviours';
import * as behaviourTokens from '../behaviours/tokens';
import { Handler } from '../lambda';
import { ConfigResolver } from './config-resolver';
import { EventParser } from './event-parser';
import { LogglySender } from './loggly-sender';

export type Event = CloudWatchLogsEvent | any;

export type GroupParsingBehaviour = 'ecs';

export type GroupConfig = {
  match: string;
  tags: string[];
  behaviour?: GroupParsingBehaviour;
}

export type Config = {
  groups: GroupConfig[];
}

@Injectable()
export class LogglyHandler implements Handler<Event> {
  constructor(private configResolver: ConfigResolver,
              private eventParser: EventParser,
              private sender: LogglySender,
              @Inject(behaviourTokens.AllBehaviours) private behaviours: { [key: string]: Behaviour }) {
  }

  async handle(event: Event): Promise<void> {
    let unzipped  = zlib.gunzipSync(new Buffer(event.awslogs.data, 'base64'));
    let text      = unzipped.toString('ascii');
    let decoded   = JSON.parse(text) as CloudWatchLogsDecodedData;
    let config    = this.configResolver.resolve(decoded.logGroup);
    let behaviour = _.get(this.behaviours, config.behaviour, this.behaviours['default']) as Behaviour;

    let events = decoded.logEvents.map(ev => {
      return Object.assign(
        this.eventParser.getData(decoded.logGroup, decoded.logStream, ev),
        behaviour.getData(decoded.logGroup, decoded.logStream, ev)
      );
    });

    await this.sender.send(events, config.tags);
  }
}
