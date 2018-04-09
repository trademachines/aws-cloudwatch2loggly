import * as _ from 'lodash';
import { Response } from 'request';


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

export type RetryPolicy = (error: any, response: Response) => boolean;

export const RetryPolicies = {
  Default: DefaultRetryPolicy
};

