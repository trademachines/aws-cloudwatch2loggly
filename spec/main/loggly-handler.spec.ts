// const nock    = require('nock');
// const zlib    = require('zlib');

import * as zlib from 'zlib';
import { LogglyHandler } from '../../src/main';

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
  let eventParser;
  let sender;
  let behaviour;
  let handler: LogglyHandler;

  beforeEach(() => {
    configResolver = {
      resolve: () => config
    };
    eventParser    = {
      getData: jasmine.createSpy('eventParser.getData').and.returnValue({})
    };
    sender         = {
      send: jasmine.createSpy('sender.send').and.returnValue(Promise.resolve())
    };
    behaviour      = {
      getData: jasmine.createSpy('behaviour.getData').and.returnValue({})
    };
    handler        = new LogglyHandler(configResolver, eventParser, sender, { test: behaviour });
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

  it('calls parser and behaviour to get data', (done) => {
    const payload = logs(JSON.stringify({
      logGroup:  'test-something',
      logEvents: [
        {
          // no need to put data here, parser is mocked
        }
      ]
    }));
    config        = {
      match:     '^test',
      behaviour: 'test'
    };

    handler.handle(payload)
      .then(() => {
        expect(eventParser.getData).toHaveBeenCalled();
        expect(behaviour.getData).toHaveBeenCalled();
      })
      .then(done)
      .catch(done.fail);
  });
});
