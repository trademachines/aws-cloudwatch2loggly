// import { bootstrap as awsBootstrap, providers as awsProviders } from './aws';
// import { bootstrap as mainBootstrap, providers as mainProviders } from './main';
import { Callback, Context } from 'aws-lambda';
import { Injector, ReflectiveInjector } from 'injection-js';
import { HandlerToken } from './lambda';
import { providers as mainProviders } from './main';
import { providers as behaviourProviders } from './behaviours';

process.on('uncaughtException', (err) => {
  console.log('uncaughtException', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('unhandledRejection', reason, promise);
  throw reason;
});

export const providers = ReflectiveInjector.resolve([
  ...mainProviders(),
  ...behaviourProviders()
]);
export const injector  = ReflectiveInjector.fromResolvedProviders(providers);
export const bootstrap = (i?: Injector) => [].forEach(b => b(i || injector));
export const handle    = (event: any, ctx: Context, cb: Callback) => {
  let handler = injector.get(HandlerToken);
  handler.handle(event, ctx)
    .then(() => cb())
    .catch(err => cb(err));
};
