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
});
