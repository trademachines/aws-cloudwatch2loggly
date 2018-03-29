import * as _ from 'lodash';
import { Response } from 'request';
import * as request from 'request-promise-native'

export type RetryPolicy = (error: any, response: Response) => boolean;

export type DelayStrategy = (attempt: number) => number;

export type RetryOptions = {
  retry: {
    maxAttempts: number;
    retryPolicy: RetryPolicy;
    delayStrategy: DelayStrategy
  }
};

const RetryMarker = '!!!';

function retry(args, originalFn) {

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

const RetriableNetworkErrors = [
  'ECONNRESET', 'ENOTFOUND', 'ESOCKETTIMEDOUT', 'ETIMEDOUT',
  'ECONNREFUSED', 'EHOSTUNREACH', 'EPIPE', 'EAI_AGAIN'
];

function NetworkError(error: any, _response: Response) {
  let code = _.get(error, 'cause.code');

  return _.includes(RetriableNetworkErrors, code);
}

function HttpError(error: any, response: Response) {
  let responseCode = _.get(response, 'statusCode');
  let errorCode    = _.get(error, 'statusCode');
  let response5xx  = 500 <= responseCode && responseCode < 600;
  let error5xx     = 500 <= errorCode && errorCode < 600;

  return response5xx || error5xx;
}

function DefaultRetryPolicy(error: any, response: Response) {
  return HttpError(error, response) || NetworkError(error, response);
}

export const RetryPolicies = {
  Default: DefaultRetryPolicy
};


function ExponentialBackoff(base: number): DelayStrategy {
  return attempt => base * 2 ** attempt;
}

export const DelayStrategies = {
  ExponentialBackoff: ExponentialBackoff
};
