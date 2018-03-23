import { EventParser } from '../../src/main';

describe('parse events', () => {
  let parser;
  const event = {
    timestamp: new Date().getTime(),
    message:   '',
  };

  beforeEach(() => {
    parser = new EventParser();
  });

  it('creates event', () => {
    const myEvent     = Object.assign({}, event, { message: 'foobar' });
    const parsedEvent = parser.getData('group', 'stream', myEvent);

    expect(parsedEvent).toEqual({
      timestamp: jasmine.any(String),
      message:   'foobar',
      logGroup:  'group',
      logStream: 'stream',
    });
  });

  it('trims messages', () => {
    const myEvent     = Object.assign({}, event, { message: 'foobar     ' });
    const parsedEvent = parser.getData('group', 'stream', myEvent);

    expect(parsedEvent).toEqual(jasmine.objectContaining({
      message: 'foobar'
    }));
  });
});
