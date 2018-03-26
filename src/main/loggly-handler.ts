import { CloudWatchLogsDecodedData, CloudWatchLogsEvent } from 'aws-lambda';
import { Injectable } from 'injection-js';
import * as zlib from 'zlib';
import { Handler } from '../lambda';
import { ConfigResolver } from './config-resolver';
import { LogglySender } from './loggly-sender';
import { DefaultStrategyIdentifier } from './strategies';
import { StrategyCollection } from './strategies/collection';

export type Event = CloudWatchLogsEvent | any;

export type GroupStrategy = string;

export type GroupConfig = {
  match: string;
  tags: string[];
  strategy?: GroupStrategy;
}

export type Config = {
  groups: GroupConfig[];
}

@Injectable()
export class LogglyHandler implements Handler<Event> {
  constructor(private configResolver: ConfigResolver,
              private sender: LogglySender,
              private strategies: StrategyCollection) {
  }

  async handle(event: Event): Promise<void> {
    let unzipped      = zlib.gunzipSync(new Buffer(event.awslogs.data, 'base64'));
    let text          = unzipped.toString('ascii');
    let decoded       = JSON.parse(text) as CloudWatchLogsDecodedData;
    let config        = this.configResolver.resolve(decoded.logGroup);
    let strategyIdent = config.strategy || DefaultStrategyIdentifier;
    let strategy      = this.strategies.get(strategyIdent);

    if (!strategy) {
      throw new Error(`Can not find strategy ${strategyIdent}`);
    }

    let events = decoded.logEvents.map(ev => {
      let context = {
        group:  decoded.logGroup,
        stream: decoded.logStream,
        event:  ev
      };

      return strategy.from(context);
    }).filter(x => null !== x);

    await this.sender.send(events, config.tags);
  }
}
