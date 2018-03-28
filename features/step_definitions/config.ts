import { defineSupportCode } from 'cucumber';
import { Configuration } from '../../src/main/configuration';
import { CustomWorld } from '../support/world';

defineSupportCode(({ Given }) => {
  Given(/^the config is set to$/, function (this: CustomWorld, config: string) {
    let configuration = this.injector.get(Configuration);
    configuration.setConfig(JSON.parse(config));
  });
});
