import { defineSupportCode } from 'cucumber';
import { ConfigResolver } from '../../src/main';
import { CustomWorld, TestConfigResolver } from '../support/world';

defineSupportCode(({ Given }) => {
  Given(/^the config is set to$/, function (this: CustomWorld, config: string) {
    let resolver = this.injector.get(ConfigResolver) as TestConfigResolver;
    resolver.setConfig(config);
  });
});
