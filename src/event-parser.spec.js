const parser = require('./event-parser');

describe('parse events', () => {
  const event = {
    timestamp: new Date().getTime(),
    message: '',
  };

  it('creates event', () => {
    const myEvent = Object.assign({}, event, {message: 'foobar'});

    parser('group', 'stream', myEvent, (err, ev) => {
      expect(ev).toEqual(jasmine.objectContaining({
        timestamp: jasmine.any(String),
        message: 'foobar',
        logGroup: 'group',
        logStream: 'stream',
      }));
    });
  });

  it('trims messages', () => {
    const myEvent = Object.assign({}, event, {message: 'foobar     '});

    parser('', '', myEvent, (err, ev) => {
      expect(ev).toEqual(jasmine.objectContaining({
        message: 'foobar',
      }));
    });
  });

  it('adds some more infos for docker stream names', () => {
    const stream = 'prefix/with/slashes/container/id';

    parser('group', stream, event, (err, ev) => {
      expect(ev).toEqual(jasmine.objectContaining({
        dockerPrefix: 'prefix/with/slashes',
        dockerContainer: 'container',
        dockerTaskId: 'id',
      }));
    });
  });
});
