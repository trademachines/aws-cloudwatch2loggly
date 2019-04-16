import { SnsStrategy } from '../../../src/main/strategies';

describe('sns strategy', () => {
  let strategy: SnsStrategy;

  beforeEach(() => {
    strategy = new SnsStrategy();
  });

  it('adds topic arn', () => {
    const topicArn = 'topic-arn';
    const data = strategy.fromMessage({
      stream: null,
      group:  null,
      event:  {
        id:        null,
        timestamp: null,
        message:   JSON.stringify({
          notification: {
            topicArn: topicArn,
          }
        })
      }
    });

    expect(data).toEqual(jasmine.objectContaining({
      snsTopicArn: topicArn
    }));
  });

  it('adds delivery destination', () => {
    const deliveryDestination = 'arn:aws:sqs:aws-test-1:123456789012:dbg-sns-40599u1jui68jlx';
    const data = strategy.fromMessage({
      stream: null,
      group:  null,
      event:  {
        id:        null,
        timestamp: null,
        message:   JSON.stringify({
          delivery: {
            destination: deliveryDestination
          }
        })
      }
    });

    expect(data).toEqual(jasmine.objectContaining({
      snsDeliveryDestination: deliveryDestination
    }));
  });

  it('uses provider response as message', () => {
    const providerResponse = 'Something went wrong';
    const data = strategy.fromMessage({
      stream: null,
      group:  null,
      event:  {
        id:        null,
        timestamp: null,
        message:   JSON.stringify({
          delivery: {
            providerResponse: providerResponse
          }
        })
      }
    });

    expect(data).toEqual(jasmine.objectContaining({
      message: providerResponse
    }));
  });
});
