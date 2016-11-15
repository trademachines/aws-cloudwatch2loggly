const parser = require('./event-parser');

describe('parse events', () => {
  const event = {
    timestamp: new Date().getTime(),
    message: '',
  };

  it('creates event', () => {
    const myEvent     = Object.assign({}, event, {message: 'foobar'});
    const parsedEvent = parser('group', 'stream', myEvent);

    expect(parsedEvent).toEqual({
      timestamp: jasmine.any(String),
      message: 'foobar',
      logGroup: 'group',
      logStream: 'stream',
    });
  });

  it('trims messages', () => {
    const myEvent     = Object.assign({}, event, {message: 'foobar     '});
    const parsedEvent = parser('group', 'stream', myEvent);

    expect(parsedEvent).toEqual(jasmine.objectContaining({
      message: 'foobar'
    }));
  });
});
