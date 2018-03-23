import { defineSupportCode } from 'cucumber';
import { Injector, ReflectiveInjector } from 'injection-js';
import { OptionsWithUrl, RequestResponse } from 'request';
import { providers } from '../../src/injector';
import { ConfigResolver } from '../../src/main/config-resolver';
import { LogglySender } from '../../src/main/loggly-sender';

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

export class TestConfigResolver extends ConfigResolver {
  setConfig(config: string) {
    this.config = JSON.parse(config);
  }
}

function CustomWorld(this: CustomWorld) {
  let testProviders = ReflectiveInjector.resolve([
    {
      provide:  LogglySender,
      useClass: TestLogglySender
    },
    {
      provide:  ConfigResolver,
      useClass: TestConfigResolver
    }
  ]);

  this.injector = ReflectiveInjector.fromResolvedProviders(testProviders.concat(providers));
  this.lastError = null;
}

defineSupportCode(({ setWorldConstructor }) => {
  setWorldConstructor(CustomWorld);
});
