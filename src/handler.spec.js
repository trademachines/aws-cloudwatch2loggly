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

  describe('build configs', () => {
    it('uses host from config', () => {
      const cfg    = {host: 'some.url.com'};
      const groupConfig = handler.getGroupConfig(cfg, 'none');

      expect(groupConfig.http).toEqual(jasmine.objectContaining({
        hostname: 'some.url.com',
      }));
    });

    it('uses token from config', () => {
      const cfg     = {token: 'secret-token'};
      const groupConfig = handler.getGroupConfig(cfg, 'none');

      expect(groupConfig.http).toEqual(jasmine.objectContaining({
        path: jasmine.stringMatching('/secret-token/'),
      }));
    });

    it('uses tags from config', () => {
      const cfg     = {tags: 'foo'};
      const groupConfig = handler.getGroupConfig(cfg, 'none');

      expect(groupConfig.http).toEqual(jasmine.objectContaining({
        path: jasmine.stringMatching('/foo'),
      }));
    });

    it('uses different settings for specific groups', () => {
      const cfg     = {
        host: 'generic',
        tags: 'foo',
        token: 'token-1',
        __groupMap: {
          specific: {
            host: 'specific',
            tags: 'bar',
          },
        },
      };
      const groupConfig = handler.getGroupConfig(cfg, 'specific');

      expect(groupConfig.http).toEqual(jasmine.objectContaining({
        hostname: 'specific',
        path: jasmine.stringMatching('/bar'),
      }));
    });

    it('does correctly cache options', () => {
      const cfg = {
        host: 'generic',
        __groupMap: {
          specific: {
            host: 'specific',
          },
        },
      };

      const groupConfigSpecific = handler.getGroupConfig(cfg, 'specific', 0);
      const groupConfigGeneric  = handler.getGroupConfig(cfg, 'generic', 0);

      expect(groupConfigSpecific.http.hostname).toEqual('specific');
      expect(groupConfigGeneric.http.hostname).toEqual('generic');
    });
  });

  it('sends line messages to loggly', (done) => {
    const events = [{event: 1}, {event: 2}];
    const loggly = nock('http://domain.com')
      .post(/^\/bulk\//, `{"event":1}\n{"event":2}`)
      .reply(200, 'ok');

    handler.sendToLoggly({host: 'domain.com'}, 'group', events, (err) => {
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

