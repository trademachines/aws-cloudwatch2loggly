import { Context } from 'aws-lambda';
import { CloudWatchLogs } from 'aws-sdk';
import { Injectable } from 'injection-js';
import { AbstractChainItem } from '../chain';

@Injectable()
export abstract class AbstractSubscribeHandler<T> extends AbstractChainItem<T> {
  constructor(protected cloudWatchLogs: CloudWatchLogs) {
    super();
  }

  protected async createSubscription(logGroupName: string, context: Context) {
    try {
      let filters = await this.cloudWatchLogs.describeSubscriptionFilters({ logGroupName: logGroupName }).promise();
      if (filters.subscriptionFilters) {
        await this.deleteExistingSubscription(filters.subscriptionFilters);
      }
      await this.cloudWatchLogs.putSubscriptionFilter({
        logGroupName:   logGroupName,
        filterName:     context.functionName,
        destinationArn: context.invokedFunctionArn,
        distribution:   'ByLogStream',
        filterPattern:  '',
      }).promise();
    } catch (e) {
      console.log(`Can't create subscription for log group ${logGroupName}: ${JSON.stringify(e)}`);
      throw e;
    }
  }

  private async deleteExistingSubscription(subscriptionFilters: CloudWatchLogs.SubscriptionFilters) {
    await Promise.all(
      subscriptionFilters.map(f => this.cloudWatchLogs.deleteSubscriptionFilter({
        filterName:   f.filterName,
        logGroupName: f.logGroupName
      }).promise())
    );
  }

}
