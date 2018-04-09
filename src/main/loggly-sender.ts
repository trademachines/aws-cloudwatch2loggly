import { Inject, Injectable } from 'injection-js';
import { OptionsWithUrl } from 'request';
import * as request from 'request-promise-native';
import { DelayStrategies, RetryOptions, RetryPolicies } from './request-retry';
import * as tokens from './tokens';

@Injectable()
export class LogglySender {
  constructor(@Inject(tokens.LogglyHost) private logglyHost: string,
              @Inject(tokens.LogglyToken) private logglyToken: string) {
  }

  async send(events: any[], tags: string[] = []) {
    let serialized = this.serialize(events);
    let options    = this.buildHttpOptions(tags, serialized);

    await this.doSend(options);
  }

  protected async doSend(options: OptionsWithUrl & RetryOptions) {
    await request.post(options);
  }

  protected serialize(events: any[]) {
    return events.map(e => JSON.stringify(e)).join('\n');
  }

  private buildHttpOptions(tags: string[], body: string): OptionsWithUrl & RetryOptions {
    return {
      retry:   {
        maxAttempts:   3,
        retryPolicy:   RetryPolicies.Default,
        delayStrategy: DelayStrategies.ExponentialBackoff(2000)
      },
      timeout: 2000,
      url:     `${this.logglyHost}/bulk/${this.logglyToken}/tag/${encodeURIComponent(tags.join(','))}`,
      body:    body,
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': body.length
      },
    };
  }
}
