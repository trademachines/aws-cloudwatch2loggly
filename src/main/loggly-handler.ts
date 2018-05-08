import { CloudWatchLogsDecodedData, CloudWatchLogsEvent } from 'aws-lambda';
import * as encoding from 'encoding';
import { Injectable } from 'injection-js';
import * as zlib from 'zlib';
import { AbstractChainItem } from './chain';
import { ConfigResolver } from './config-resolver';
import { LogglySender } from './loggly-sender';
import { StrategyCollection } from './strategies/collection';

export type Event = CloudWatchLogsEvent | any;

function parse(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    e.message = e.message + `: ${text}`;
    throw e;
  }
}

@Injectable()
export class LogglyHandler extends AbstractChainItem<Event> {
  constructor(private configResolver: ConfigResolver,
              private sender: LogglySender,
              private strategies: StrategyCollection) {
    super();
  }

  async handle(event: Event): Promise<void> {
    let unzipped = zlib.gunzipSync(new Buffer(event.awslogs.data, 'base64'));
    let text     = encoding.convert(unzipped, 'utf8').toString();
    let decoded  = parse(text) as CloudWatchLogsDecodedData;
    let config   = this.configResolver.resolve(decoded.logGroup);
    let strategy = this.strategies.get(config.strategy);

    if (!strategy) {
      throw new Error(`Can not find strategy ${config.strategy}`);
    }

    let context = strategy.fromContext({
      group:  decoded.logGroup,
      stream: decoded.logStream,
    });
    let events  = decoded.logEvents.map(ev => {
      let context = {
        group:  decoded.logGroup,
        stream: decoded.logStream,
        event:  ev
      };

      return strategy.fromMessage(context);
    }).filter(x => null !== x);

    await this.sender.send(context, events, config.tags);
  }
}
