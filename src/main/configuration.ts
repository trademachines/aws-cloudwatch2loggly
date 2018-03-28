import { EventEmitter } from 'events';
import * as _ from 'lodash';

export namespace Types {
  export type GroupStrategy = string;

  export type GroupConfig = {
    match: string;
    tags: string[];
    strategy?: GroupStrategy;
  }

  export type Config = {
    groups: GroupConfig[];
    subscription: {
      whitelist: string[]
    }
  }

  export type ConfigChangedEvent = {
    config: Config;
  }
}

export class Configuration extends EventEmitter {
  private config: Types.Config;

  constructor(config: Types.Config) {
    super();
    this.setConfig(config);
  }

  getConfig() {
    return this.config;
  }

  setConfig(config: Types.Config) {
    this.config = _.defaultsDeep(config, {
      groups:       [],
      subscription: {
        whitelist: []
      }
    });
    this.emit('changed', { config: this.config });
  }
}
