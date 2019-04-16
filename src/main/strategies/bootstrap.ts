import { Injector, Provider } from 'injection-js';
import { StrategyCollection } from './collection';
import { DefaultStrategy } from './default';
import { EcsStrategy } from './ecs';
import { LambdaStrategy } from './lambda';
import { SnsStrategy } from './sns';

export function providers(): Provider[] {
  return [
    EcsStrategy,
    LambdaStrategy,
    SnsStrategy,
    DefaultStrategy,
    StrategyCollection
  ];
}

export function bootstrap(injector: Injector): void {
  let collection = injector.get(StrategyCollection);
  collection.add(injector.get(DefaultStrategy));
  collection.add(injector.get(EcsStrategy));
  collection.add(injector.get(LambdaStrategy));
  collection.add(injector.get(SnsStrategy));
}
