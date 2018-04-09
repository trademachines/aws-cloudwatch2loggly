import * as _ from 'lodash';
import * as request from 'request-promise-native';
import { DelayStrategy } from './delay-strategies';
import { RetryPolicy } from './retry-policies';

export type RetryOptions = {
  retry: {
    maxAttempts: number;
    retryPolicy: RetryPolicy;
    delayStrategy: DelayStrategy
  }
};

type OriginalRequestPromiseMethod = (options: request.Options) => request.RequestPromise

const RetryMarker = {};

function retry(args: request.Options & RetryOptions, originalFn: OriginalRequestPromiseMethod) {
  let retryOptions = args.retry;
  let fullResponse = args.resolveWithFullResponse || false;
  delete args.retry;
  args.resolveWithFullResponse = true;

  let check = (attempt, response, err) => {
    if (attempt < retryOptions.maxAttempts && retryOptions.retryPolicy(err, response)) {
      return new Promise(resolve => setTimeout(() => resolve(RetryMarker), retryOptions.delayStrategy(attempt)));
    }

    if (err) {
      return Promise.reject(err);
    }

    return Promise.resolve(fullResponse ? response : response.body);
  };
  let tryIt = (attempt = 1) => {
    return originalFn(args)
      .then(response => check(attempt, response, null), err => check(attempt, null, err))
      .then(x => x === RetryMarker ? tryIt(++attempt) : x);
  };

  return tryIt();
}

// decorate original request methods
['get', 'head', 'options', 'post', 'put', 'patch', 'del', 'delete'].forEach(verb => {
  let original  = request[verb];
  request[verb] = (args) => {
    if (!_.isPlainObject(args)) {
      return Promise.reject('You are only allowed to provide options as an object');
    }
    args = _.assign({}, args);

    return retry(args, original);
  };
});
