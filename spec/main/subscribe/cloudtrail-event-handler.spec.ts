import { Context } from 'aws-lambda';
import { HandlerItem } from '../../../src/main/chain';
import { Configuration } from '../../../src/main/configuration';
import { CloudTrailEvent, CloudtrailEventHandler } from '../../../src/main/subscribe';

function awsResponse<T>(p: Promise<T>) {
  return {
    promise: () => p
  };
}

describe('handling cloudtrail events', () => {
  let cloudwatchLogs;
  let config: Configuration;
  let handler: CloudtrailEventHandler;

  let subscriptionFiltersResponse;

  beforeEach(() => {
    subscriptionFiltersResponse = {};
    cloudwatchLogs              = {
      putSubscriptionFilter:       () => awsResponse(Promise.resolve({})),
      deleteSubscriptionFilter:    () => awsResponse(Promise.resolve({})),
      describeSubscriptionFilters: () => awsResponse(Promise.resolve(subscriptionFiltersResponse))
    };
    config                      = new Configuration({
      groups:       [],
      subscription: {
        whitelist: ['.+\-whitelisted$']
      }
    });
    handler                     = new CloudtrailEventHandler(cloudwatchLogs, config);
  });

  it('will forward events that are not from logs.amazonaws.com', done => {
    let next  = {
      handle:  jasmine.createSpy('next.handle'),
      setNext: () => next
    } as HandlerItem<any>;
    let event = {
      detail: {
        eventSource: 'something.else'
      }
    } as CloudTrailEvent;

    handler.setNext(next);
    handler.handle(event, null)
      .then(() => {
        expect(next.handle).toHaveBeenCalledWith(event, null);
      })
      .then(done)
      .catch(done.fail);
  });

  it('will not create subscription for log groups that are not whitelisted', done => {
    spyOn(cloudwatchLogs, 'putSubscriptionFilter').and.callThrough();

    let event = {
      detail: {
        eventSource:       'logs.amazonaws.com',
        eventName:         'CreateLogGroup',
        requestParameters: {
          logGroupName: 'some-random-log-group'
        }
      }
    } as CloudTrailEvent;

    handler.handle(event, null)
      .then(() => {
        expect(cloudwatchLogs.putSubscriptionFilter).not.toHaveBeenCalled();
      })
      .then(done)
      .catch(done.fail);
  });

  it('will delete existing subscription ', done => {
    spyOn(cloudwatchLogs, 'deleteSubscriptionFilter').and.callThrough();

    subscriptionFiltersResponse = {
      subscriptionFilters: [
        {
          filterName:   'existing-filter',
          logGroupName: 'log-group-that-is-whitelisted'
        }
      ]
    };
    let event                   = {
      detail: {
        eventSource:       'logs.amazonaws.com',
        eventName:         'CreateLogGroup',
        requestParameters: {
          logGroupName: 'log-group-that-is-whitelisted'
        }
      }
    } as CloudTrailEvent;

    handler.handle(event, {} as Context)
      .then(() => {
        expect(cloudwatchLogs.deleteSubscriptionFilter).toHaveBeenCalledWith({
          filterName:   'existing-filter',
          logGroupName: 'log-group-that-is-whitelisted'
        });
      })
      .then(done)
      .catch(done.fail);
  });

  it('will put subscription ', done => {
    spyOn(cloudwatchLogs, 'putSubscriptionFilter').and.callThrough();

    let event   = {
      detail: {
        eventSource:       'logs.amazonaws.com',
        eventName:         'CreateLogGroup',
        requestParameters: {
          logGroupName: 'log-group-that-is-whitelisted'
        }
      }
    } as CloudTrailEvent;
    let context = {
      functionName:       'function-name',
      invokedFunctionArn: 'function-arn'
    };

    handler.handle(event, context as Context)
      .then(() => {
        expect(cloudwatchLogs.putSubscriptionFilter).toHaveBeenCalledWith({
          logGroupName:   'log-group-that-is-whitelisted',
          filterName:     'function-name',
          destinationArn: 'function-arn',
          distribution:   'ByLogStream',
          filterPattern:  '',
        });
      })
      .then(done)
      .catch(done.fail);
  });
});
