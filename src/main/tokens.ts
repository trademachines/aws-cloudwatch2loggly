import { InjectionToken } from 'injection-js';

export const Config = new InjectionToken('config for handler');
export const LogglyHost = new InjectionToken('loggly endpoint');
export const LogglyToken = new InjectionToken('loggly token');
