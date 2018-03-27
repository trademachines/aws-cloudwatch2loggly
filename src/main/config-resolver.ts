import { Injectable } from 'injection-js';
import * as _ from 'lodash';
import { Configuration, Types } from './configuration';

type InternalGroupConfig = Types.GroupConfig & {
  matchRegex?: RegExp;
};

type InternalConfig = Types.Config & {
  groups: InternalGroupConfig[];
};

@Injectable()
export class ConfigResolver {
  protected config: InternalConfig;
  protected resolved: { [key: string]: InternalGroupConfig } = {};

  constructor(config: Configuration) {
    this.parseConfig(config.getConfig());
    config.on('changed', (ev: Types.ConfigChangedEvent) => this.parseConfig(ev.config));
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

  protected parseConfig(config: Types.Config) {
    this.resolved = {};
    this.config   = Object.assign({}, config) as InternalConfig;
    this.config.groups.forEach((g: InternalGroupConfig) => {
      g.matchRegex = new RegExp(g.match, 'i');
    });
  }
}
