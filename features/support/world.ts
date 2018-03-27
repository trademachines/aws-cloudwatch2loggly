import { AWSError, CloudWatchLogs } from 'aws-sdk';
import { defineSupportCode } from 'cucumber';
import { Injector, ReflectiveInjector } from 'injection-js';
import { OptionsWithUrl, RequestResponse } from 'request';
import { bootstrap, providers } from '../../src/injector';
import { LogglySender } from '../../src/main';

export interface CustomWorld {
}

export interface CustomWorld {
  lastResponse: RequestResponse;
  injector: Injector;
  lastError: any;
}

export class TestLogglySender extends LogglySender {
  requests: OptionsWithUrl[] = [];

  protected async doSend(options: OptionsWithUrl) {
    this.requests.push(options);
  }
}

export class TestCloudWatchLogs {
  private logGroups = {};

  describeSubscriptionFilters(params: CloudWatchLogs.Types.DescribeSubscriptionFiltersRequest) {
    let group = this.logGroups[params.logGroupName];
    if (group) {
      return this.resolve(group);
    }

    return this.reject(new AWSError());
  }

  putSubscriptionFilter(params: CloudWatchLogs.Types.PutSubscriptionFilterRequest) {
    let group = this.logGroups[params.logGroupName];
    if (!group) {
      return this.reject(new AWSError());
    }

    group.subscriptionFilters = [params];

    return this.resolve({});
  }

  addLogGroup(logGroupName: string) {
    this.logGroups[logGroupName] = {};
  }

  getLogGroup(name: string) {
    return this.logGroups[name];
  }

  private resolve(content: any) {
    return this.respond(Promise.resolve(content));
  }

  private reject(err: AWSError) {
    return this.respond(Promise.reject(err));
  }

  private respond<T>(p: Promise<T>) {
    return {
      promise: () => p
    };
  }
}

function CustomWorld(this: CustomWorld) {
  let testProviders = ReflectiveInjector.resolve([
    {
      provide:  LogglySender,
      useClass: TestLogglySender
    },
    {
      provide:  CloudWatchLogs,
      useClass: TestCloudWatchLogs
    }
  ]);

  this.injector  = ReflectiveInjector.fromResolvedProviders(testProviders.concat(providers));
  this.lastError = null;
  bootstrap(this.injector);
}

defineSupportCode(({ setWorldConstructor }) => {
  setWorldConstructor(CustomWorld);
});
