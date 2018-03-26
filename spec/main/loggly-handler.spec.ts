import * as zlib from 'zlib';
import { LogglyHandler } from '../../src/main';
import { Strategy } from '../../src/main/strategies';
import { StrategyCollection } from '../../src/main/strategies/collection';

function logs(text: string) {
  return {
    awslogs: {
      data: zlib.gzipSync(new Buffer(text, 'ascii')).toString('base64'),
    },
  }
}

describe('handle events', () => {
  // let event;
  let configResolver;
  let config;
  let sender;
  let strategy;
  let collection;
  let handler: LogglyHandler;

  beforeEach(() => {
    configResolver = {
      resolve: () => config
    };
    sender         = {
      send: jasmine.createSpy('sender.send').and.returnValue(Promise.resolve())
    };
    strategy       = {
      ident: 'test',
      from:  jasmine.createSpy('strategy.from').and.returnValue({})
    } as Strategy;
    collection     = new StrategyCollection();
    collection.add(strategy);

    handler = new LogglyHandler(configResolver, sender, collection);
  });

  it('catches json.parse errors', done => {
    const payload = logs('{');

    handler.handle(payload)
      .then(() => done.fail())
      .catch(err => {
        expect(err).toEqual(jasmine.any(SyntaxError));
        expect(err.message).toEqual('Unexpected end of JSON input');
      })
      .then(done);
  });

  it('calls strategy to get data', (done) => {
    const payload = logs(JSON.stringify({
      logGroup:  'test-something',
      logEvents: [
        {
          // no need to put data here, parser is mocked
        }
      ]
    }));
    config        = {
      match:    '^test',
      strategy: 'test'
    };

    handler.handle(payload)
      .then(() => {
        expect(strategy.from).toHaveBeenCalled();
      })
      .then(done)
      .catch(done.fail);
  });
});
