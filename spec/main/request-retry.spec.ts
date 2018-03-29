import * as nock from 'nock';
import * as request from 'request-promise-native';
import { StatusCodeError } from 'request-promise-native/errors';
import '../../src/main/request-retry';

describe('retry http requests', () => {
  const options = {
    url:   'http://foobar.com/something',
    retry: {
      maxAttempts:   3,
      retryPolicy:   () => true,
      delayStrategy: () => 0
    }
  } as any;

  afterEach(() => {
    nock.cleanAll();
  });

  it('tries at most the number of maxAttempts', done => {
    let attemptsDone = 0;
    nock('http://foobar.com')
      .log(() => attemptsDone++)
      .post('/something')
      .times(4)
      .reply(503);

    request.post(options)
      .then(() => done.fail())
      .catch(() => {
        expect(attemptsDone).toEqual(3);
      })
      .then(done);
  });

  it('will give the last error', done => {
    let response = 'something went wrong';

    nock('http://foobar.com')
      .post('/something')
      .times(2)
      .reply(501);
    nock('http://foobar.com')
      .post('/something')
      .reply(503, response);

    request.post(options)
      .then(() => done.fail())
      .catch(x => {
        expect(x).toEqual(jasmine.any(StatusCodeError));
        expect(x.statusCode).toEqual(503);
        expect(x.error).toEqual(response);
      })
      .then(done);
  });

  it('will give the response when call was successful', done => {
    let response = 'everything is fine';

    nock('http://foobar.com')
      .post('/something')
      .times(2)
      .reply(501);
    nock('http://foobar.com')
      .post('/something')
      .reply(200, response);

    request.post(options)
      .then(r => {
        expect(r).toEqual(response);
      })
      .then(done)
      .catch(done.fail);
  });
});
