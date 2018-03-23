import { Injector, Provider } from 'injection-js';
import { EcsBehaviour } from './ecs';
import { NullBehaviour } from './null';
import * as tokens from './tokens';

export function providers(): Provider[] {
  return [
    EcsBehaviour,
    NullBehaviour,
    // TODO turn into collection class and add behaviours in bootstrap phase
    {
      provide:    tokens.AllBehaviours,
      deps:       [EcsBehaviour, NullBehaviour],
      useFactory: (ecs: EcsBehaviour, nullB: NullBehaviour) => {
        return {
          ecs:    ecs,
          'default': nullB
        };
      }
    }
  ];
}

export function bootstrap(_injector: Injector): void {
}
