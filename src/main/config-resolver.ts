import { Inject, Injectable } from 'injection-js';
import * as _ from 'lodash';
import { Config } from './loggly-handler';
import * as tokens from './tokens';

@Injectable()
export class ConfigResolver {
  protected resolved = {};

  constructor(@Inject(tokens.Config) protected config: Config) {
  }

  resolve(groupName: string) {
    if (this.resolved[groupName]) {
      return this.resolved[groupName];
    }

    // TODO move regex creation to constructor
    let groupConfig = _.find(this.config.groups, g => new RegExp(g.match, 'i').test(groupName));

    if (!groupConfig) {
      throw new Error(`Can't find config for group ${groupName}`);
    }

    return this.resolved[groupName] = groupConfig;
  }
}
