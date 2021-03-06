import { Context } from 'aws-lambda';
import { expect } from 'chai';
import { defineSupportCode } from 'cucumber';
import { HandlerToken } from '../../src/lambda';
import { CustomWorld } from '../support/world';

defineSupportCode(({ Given, When, Then }) => {
  let lambdaContext = {
    functionName:       'test',
    invokedFunctionArn: 'arn:aws:lambda:eu-test-1:xxxxxxxxxxxx:function:test',
  } as Context;

  function sendMessage(world: CustomWorld, msg: any) {
    let handler = world.injector.get(HandlerToken);

    return handler.handle(msg, lambdaContext)
      .then(() => world.lastError = null)
      .catch(err => world.lastError = err);
  }

  Given(/^the Lambda context is set to$/, (context: string) => {
    lambdaContext = JSON.parse(context);
  });

  Then(/^dump last error$/, function (this: CustomWorld) {
    console.log(this.lastError);
  });

  Then(/^an error occured$/, function (this: CustomWorld) {
    expect(this.lastError).not.to.be.null;
  });

  Then(/^an error occured stating "(.+)"$/, function (this: CustomWorld, expectedErrMsg: string) {
    let errMsg = this.lastError instanceof Error ? this.lastError.message : this.lastError;
    expect(this.lastError).not.to.be.null;
    expect(errMsg).to.eq(expectedErrMsg);
  });

  When(/^I send the file "(.+)"$/, function (this: CustomWorld, file: string) {
    let data = require(`${__dirname}/../fixtures/${file}`);
    return sendMessage(this, data);
  });

  When(/^I send the message$/, function (this: CustomWorld, msg: string) {
    let data = JSON.parse(msg);
    return sendMessage(this, data);
  });
});
