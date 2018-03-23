import { Callback, Context } from 'aws-lambda';
import { Injector, ReflectiveInjector } from 'injection-js';
import { HandlerToken } from './lambda';
import { providers as mainProviders, bootstrap as mainBootstrap } from './main';

process.on('uncaughtException', (err) => {
  console.log('uncaughtException', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('unhandledRejection', reason, promise);
  throw reason;
});

export const providers = ReflectiveInjector.resolve([
  ...mainProviders()
]);
export const injector  = ReflectiveInjector.fromResolvedProviders(providers);
export const bootstrap = (i?: Injector) => [mainBootstrap].forEach(b => b(i || injector));
export const handle    = (event: any, ctx: Context, cb: Callback) => {
  let handler = injector.get(HandlerToken);
  handler.handle(event, ctx)
    .then(() => cb())
    .catch(err => cb(err));
};
