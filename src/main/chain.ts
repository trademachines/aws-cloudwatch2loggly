import { Context } from 'aws-lambda';
import { Handler } from '../lambda';

export interface HandlerItem<T> extends Handler<T> {
  setNext(item: HandlerItem<any>): HandlerItem<any>;
}

export abstract class AbstractChainItem<T> implements HandlerItem<T> {
  protected next: HandlerItem<T>;

  async handle(event: T, context?: Context): Promise<any> {
    await this.next.handle(event, context);
  };

  setNext(item: HandlerItem<any>) {
    this.next = item;
    return item;
  }
}
