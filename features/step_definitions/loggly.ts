import { expect } from 'chai';
import { defineSupportCode } from 'cucumber';
import * as _ from 'lodash';
import { LogglySender } from '../../src/main';
import { CustomWorld, TestLogglySender } from '../support/world';

defineSupportCode(({ Then }) => {
  Then(/^a request to Loggly was send at "(.+)" with$/, function (this: CustomWorld, url: string, body: string) {
    body       = body.trim();
    let sender = this.injector.get(LogglySender) as TestLogglySender;
    let found  = _.some(sender.requests, r => {
      return decodeURIComponent(r.url as string) === url && r.body.trim() === body;
    });
    let errMsg = `Calls made: ` + sender.requests.map(r => `  ${r.url}\n---\n${r.body.trim()}\n\n`);

    expect(found, errMsg).to.be.true;
  });

  Then(/^no request to Loggly was send$/, function (this: CustomWorld) {
    let sender = this.injector.get(LogglySender) as TestLogglySender;

    expect(sender.requests, `Found ${sender.requests.length} requests instead of 0`).to.be.empty;
  });
});
