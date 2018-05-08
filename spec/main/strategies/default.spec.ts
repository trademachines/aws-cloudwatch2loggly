import { DefaultStrategy } from '../../../src/main/strategies';

describe('parse events', () => {
  let strategy: DefaultStrategy;
  const event = {
    timestamp: new Date().getTime(),
    message:   '',
  };

  function message(event, group = 'group', stream = 'stream') {
    return {
      group:  group,
      stream: stream,
      event:  event
    };
  }

  beforeEach(() => {
    strategy = new DefaultStrategy();
  });

  it('turns timestamp into iso string', () => {
    const myEvent     = Object.assign({}, event, { timestamp: 1519862400000 });
    const parsedEvent = strategy.fromMessage(message(myEvent));

    expect(parsedEvent).toEqual(jasmine.objectContaining({
      timestamp: '2018-03-01T00:00:00.000Z'
    }));
  });

  it('trims messages', () => {
    const myEvent     = Object.assign({}, event, { message: 'foobar     ' });
    const parsedEvent = strategy.fromMessage(message(myEvent));

    expect(parsedEvent).toEqual(jasmine.objectContaining({
      message: 'foobar'
    }));
  });

  it('passes group and stream as is', () => {
    const parsedEvent = strategy.fromMessage(message(event, 'test-group', 'test-stream'));

    expect(parsedEvent).toEqual(jasmine.objectContaining({
      logGroup:  'test-group',
      logStream: 'test-stream'
    }));
  });
});
