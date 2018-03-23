import { EventContext } from '../types';

export type StrategyIdentifier = string;

export interface Strategy {
  ident: StrategyIdentifier;

  from(ctx: EventContext): any;
}
