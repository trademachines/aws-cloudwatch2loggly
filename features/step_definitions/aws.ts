import { CloudWatchLogs } from 'aws-sdk';
import { expect } from 'chai';
import { defineSupportCode } from 'cucumber';
import * as _ from 'lodash';
import { CustomWorld, TestCloudWatchLogs } from '../support/world';

defineSupportCode(({ Given, Then }) => {
  Given(/^I have a log group "(.+)"$/, function (this: CustomWorld, logGroupName: string) {
    let logs = this.injector.get(CloudWatchLogs) as any as TestCloudWatchLogs;
    logs.addLogGroup(logGroupName);
  });

  Then(/^I have a subscription filter for log group "(.+)" with name "(.+)" pointing to "(.+)"$/, function (this: CustomWorld, logGroupName: string, filterName: string, destinationArn: string) {
    let logs  = this.injector.get(CloudWatchLogs) as any as TestCloudWatchLogs;
    let group = logs.getLogGroup(logGroupName);

    expect(group).to.exist;
    expect(
      _.some(group.subscriptionFilters, f => f.filterName === filterName && f.destinationArn === destinationArn)
    ).to.be.true;
  });

  Then(/^I don't have a subscription filter for log group "(.+)"$/, function (this: CustomWorld, logGroupName: string) {
    let logs  = this.injector.get(CloudWatchLogs) as any as TestCloudWatchLogs;
    let group = logs.getLogGroup(logGroupName);

    expect(group).to.exist;
    expect(
      group.subscriptionFilters || []
    ).to.have.lengthOf(0);
  });
});
