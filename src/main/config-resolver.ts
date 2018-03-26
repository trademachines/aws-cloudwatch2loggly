import { Inject, Injectable } from 'injection-js';
import * as _ from 'lodash';
import { Config, GroupConfig } from './loggly-handler';
import * as tokens from './tokens';

type InternalGroupConfig = GroupConfig & {
  matchRegex?: RegExp;
};
type InternalConfig = Config & {
  groups: InternalGroupConfig[];
};

@Injectable()
export class ConfigResolver {
  protected config: InternalConfig;
  protected resolved: { [key: string]: GroupConfig } = {};

  constructor(@Inject(tokens.Config) config: Config) {
    this.parseConfig(config);
  }

  resolve(groupName: string) {
    if (this.resolved[groupName]) {
      return this.resolved[groupName];
    }

    let groupConfig = _.find(this.config.groups, g => g.matchRegex.test(groupName));

    if (!groupConfig) {
      throw new Error(`Can't find config for group ${groupName}`);
    }

    return this.resolved[groupName] = groupConfig;
  }

  protected parseConfig(config: Config) {
    this.config = Object.assign({}, config) as InternalConfig;
    this.config.groups.forEach((g: InternalGroupConfig) => {
      g.matchRegex = new RegExp(g.match, 'i');
    });
  }
}
