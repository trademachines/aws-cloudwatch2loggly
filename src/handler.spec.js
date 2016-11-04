'use strict';

const nock    = require('nock');
const zlib    = require('zlib');
const handler = require('./handler');

describe('handle events', () => {
  let event;

  beforeEach(() => {
    handler.reset();
    event = {
      timestamp: new Date().getTime(),
      message: '',
    };
  });

  describe('build http options', () => {
    it('uses host from config', () => {
      const options = handler.buildHttpOptions({host: 'some.url.com'}, 0);

      expect(options).toEqual(jasmine.objectContaining({
        hostname: 'some.url.com',
      }));
    });

    it('uses token from config', () => {
      const options = handler.buildHttpOptions({token: 'secret-token'}, 0);

      expect(options).toEqual(jasmine.objectContaining({
        path: jasmine.stringMatching('/secret-token/'),
      }));
    });

    it('uses tags from config', () => {
      const options = handler.buildHttpOptions({token: 'foo,bar'}, 0);

      expect(options).toEqual(jasmine.objectContaining({
        path: jasmine.stringMatching('/foo,bar'),
      }));
    });
  });

  describe('parse events', () => {
    it('creates event', () => {
      const myEvent = Object.assign(event, {message: 'foobar'});

      handler.parseLogEvent('group', 'stream', myEvent, (err, ev) => {
        expect(ev).toEqual(jasmine.objectContaining({
          timestamp: jasmine.any(String),
          message: 'foobar',
          logGroup: 'group',
          logStream: 'stream',
        }));
      });
    });

    it('trims messages', () => {
      const myEvent = Object.assign(event, {message: 'foobar     '});

      handler.parseLogEvent('', '', myEvent, (err, ev) => {
        expect(ev).toEqual(jasmine.objectContaining({
          message: 'foobar',
        }));
      });
    });

    it('adds some more infos for docker stream names', () => {
      const stream = 'prefix/container/id';

      handler.parseLogEvent('group', stream, event, (err, ev) => {
        expect(ev).toEqual(jasmine.objectContaining({
          dockerPrefix: 'prefix',
          dockerContainer: 'container',
          dockerTaskId: 'id',
        }));
      });
    });
  });

  it('sends line messages to loggly', (done) => {
    const events = [{event: 1}, {event: 2}];
    const loggly = nock('http://domain.com')
      .post(/^\/bulk\//, `{"event":1}\n{"event":2}`)
      .reply(200, 'ok');

    handler.sendToLoggly({host: 'domain.com'}, events, (err) => {
      if (err) {
        return done.fail(err);
      }

      expect(loggly.isDone()).toBeTruthy();
      done();
    });
  });

  it('sends zipped data', (done) => {
    const data    = JSON.stringify({
      logGroup: 'group',
      logStream: 'stream',
      logEvents: [event, event],
    });
    const payload = {
      awslogs: {
        data: zlib.gzipSync(new Buffer(data, 'ascii')).toString('base64'),
      },
    };

    const loggly = nock('http://domain.com')
      .post(/^\/bulk\//)
      .reply(200, 'ok');

    handler(null, {host: 'domain.com'}, payload, null, (err) => {
      if (err) {
        done.fail(err);
      }

      expect(loggly.isDone()).toBeTruthy();

      done();
    });
  });
});

