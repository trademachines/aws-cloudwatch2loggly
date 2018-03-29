import * as nock from 'nock';
import { LogglySender } from '../../src/main';

describe('sending data to loggly', () => {
  let sender: LogglySender;

  beforeEach(() => {
    sender = new LogglySender('http://test', 'test-token');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('stringifies events', done => {
    const events = [{ event: 1 }, { event: 2 }];
    const loggly = nock(/.+/)
      .post(/^\/bulk\/test-token\//, `{"event":1}\n{"event":2}`)
      .reply(200, 'ok');

    sender.send(events)
      .then(() => {
        expect(loggly.isDone()).toBeTruthy();
      })
      .then(done, done.fail);
  });


  it('uses tags to enrich data', done => {
    const events = [{ event: '' }];
    const loggly = nock(/.+/)
      .post(/^\/bulk\/test-token\/tag\/one%2Ctwo/)
      .reply(200, 'ok');

    sender.send(events, ['one', 'two'])
      .then(() => {
        expect(loggly.isDone()).toBeTruthy();
      })
      .then(done, done.fail);
  });
});
