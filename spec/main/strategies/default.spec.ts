import { DefaultStrategy } from '../../../src/main/strategies';

describe('parse events', () => {
  let strategy;
  const event = {
    timestamp: new Date().getTime(),
    message:   '',
  };

  beforeEach(() => {
    strategy = new DefaultStrategy();
  });

  it('creates event', () => {
    const myEvent     = Object.assign({}, event, { message: 'foobar' });
    const parsedEvent = strategy.from({ group: 'group', stream: 'stream', event: myEvent });

    expect(parsedEvent).toEqual({
      timestamp: jasmine.any(String),
      message:   'foobar',
      logGroup:  'group',
      logStream: 'stream',
    });
  });

  it('trims messages', () => {
    const myEvent     = Object.assign({}, event, { message: 'foobar     ' });
    const parsedEvent = strategy.from({ group: 'group', stream: 'stream', event: myEvent });

    expect(parsedEvent).toEqual(jasmine.objectContaining({
      message: 'foobar'
    }));
  });
});
