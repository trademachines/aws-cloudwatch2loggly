import { defineSupportCode } from 'cucumber';
import { Injector, ReflectiveInjector } from 'injection-js';
import { OptionsWithUrl, RequestResponse } from 'request';
import { bootstrap, providers } from '../../src/injector';
import { ConfigResolver, LogglySender } from '../../src/main';

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
    super.parseConfig(JSON.parse(config));
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

  this.injector  = ReflectiveInjector.fromResolvedProviders(testProviders.concat(providers));
  this.lastError = null;
  bootstrap(this.injector);
}

defineSupportCode(({ setWorldConstructor }) => {
  setWorldConstructor(CustomWorld);
});
