import { Injector, Provider } from 'injection-js';
import { CloudtrailEventHandler } from './cloudtrail-event-handler';
import { ManualEventHandler } from './manual-event-handler';

export function providers(): Provider[] {
  return [
    CloudtrailEventHandler,
    ManualEventHandler
  ];
}

export function bootstrap(_injector: Injector): void {
}
