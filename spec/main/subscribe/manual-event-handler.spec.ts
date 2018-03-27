import { Context } from 'aws-lambda';
import { HandlerItem } from '../../../src/main/chain';
import { ManualEvent, ManualEventHandler } from '../../../src/main/subscribe';

function awsResponse<T>(p: Promise<T>) {
  return {
    promise: () => p
  };
}

describe('handling manual events', () => {
  let cloudwatchLogs;
  let handler: ManualEventHandler;

  let subscriptionFiltersResponse;

  beforeEach(() => {
    subscriptionFiltersResponse = {};
    cloudwatchLogs              = {
      putSubscriptionFilter:       () => awsResponse(Promise.resolve({})),
      deleteSubscriptionFilter:    () => awsResponse(Promise.resolve({})),
      describeSubscriptionFilters: () => awsResponse(Promise.resolve(subscriptionFiltersResponse))
    };
    handler                     = new ManualEventHandler(cloudwatchLogs);
  });

  it('will forward events that are not manual', done => {
    let next  = {
      handle:  jasmine.createSpy('next.handle'),
      setNext: () => next
    } as HandlerItem<any>;
    let event = {
      source: 'foobar',
    } as any;

    handler.setNext(next);
    handler.handle(event, null)
      .then(() => {
        expect(next.handle).toHaveBeenCalledWith(event, null);
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
          logGroupName: 'log-group'
        }
      ]
    };
    let event                   = {
      source:     'manual',
      action:     'subscribe',
      parameters: {
        logGroupName: 'log-group'
      }
    } as ManualEvent;

    handler.handle(event, {} as Context)
      .then(() => {
        expect(cloudwatchLogs.deleteSubscriptionFilter).toHaveBeenCalledWith({
          filterName:   'existing-filter',
          logGroupName: 'log-group'
        });
      })
      .then(done)
      .catch(done.fail);
  });

  it('will put subscription ', done => {
    spyOn(cloudwatchLogs, 'putSubscriptionFilter').and.callThrough();

    let event   = {
      source:     'manual',
      action:     'subscribe',
      parameters: {
        logGroupName: 'log-group'
      }
    } as ManualEvent;
    let context = {
      functionName:       'function-name',
      invokedFunctionArn: 'function-arn'
    };

    handler.handle(event, context as Context)
      .then(() => {
        expect(cloudwatchLogs.putSubscriptionFilter).toHaveBeenCalledWith({
          logGroupName:   'log-group',
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
