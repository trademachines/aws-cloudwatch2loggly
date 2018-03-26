import { Injectable } from 'injection-js';
import { Strategy, StrategyIdentifier } from './types';

@Injectable()
export class StrategyCollection {
  private strategies: { [key: string]: Strategy } = {};

  add(strategy: Strategy) {
    this.strategies[strategy.ident] = strategy;
  }

  has(ident: StrategyIdentifier) {
    return this.strategies.hasOwnProperty(ident);
  }

  get(ident: StrategyIdentifier) {
    return this.strategies[ident];
  }
}
