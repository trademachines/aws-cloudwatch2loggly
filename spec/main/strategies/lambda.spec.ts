import { LambdaStrategy } from '../../../src/main/strategies';

describe('lambda strategy', () => {
  let strategy: LambdaStrategy;

  beforeEach(() => {
    strategy = new LambdaStrategy();
  });

  it('sorts out status messages', () => {
    let msgs = [
      'START RequestId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx Version: $LATEST\n',
      'END RequestId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\n',
      'REPORT RequestId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\tDuration: 378.53 ms\tBilled Duration: 400 ms Memory Size: 256 MB\tMax Memory Used: 47 MB\n'
    ];
    msgs.forEach(m => {
      let data = strategy.from({
        stream: null,
        group:  null,
        event:  {
          id:        '',
          timestamp: 1234567890,
          message:   m
        }
      });

      expect(data).toBeNull();
    })
  });

  it('adds lambda function name', () => {
    const data = strategy.from({ stream: null, group: '/aws/lambda/fn-name', event: null });

    expect(data).toEqual(jasmine.objectContaining({
      lambdaFunction: 'fn-name'
    }));
  });

  it('adds lambda request id', () => {
    const data = strategy.from({
      stream: null,
      group:  null,
      event:  {
        id:        '',
        timestamp: 1234567890,
        message:   '2018-03-01T00:01:00.000Z\txxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\tTest'
      }
    });

    expect(data).toEqual(jasmine.objectContaining({
      lambdaRequestId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      message:         'Test'
    }));
  });

  it('overwrites timestamp', () => {
    const data = strategy.from({
      stream: null,
      group:  null,
      event:  {
        id:        '',
        timestamp: 1234567890,
        message:   '2018-03-01T00:01:00.000Z\txxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\tSomething happened'
      }
    });

    expect(data).toEqual(jasmine.objectContaining({
      timestamp: '2018-03-01T00:01:00.000Z'
    }));
  });

  it('retains message in case there is no request id', () => {
    const data = strategy.from({
      stream: null,
      group:  null,
      event:  {
        id:        '',
        timestamp: 1234567890,
        message:   'Something happened'
      }
    });

    expect(data).toEqual(jasmine.objectContaining({
      message: 'Something happened'
    }));
  });
});
