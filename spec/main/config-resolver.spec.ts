import { ConfigResolver } from '../../src/main';

const groupConfigOne = {
  match:    '^one',
  tags:     ['one', 'first'],
  strategy: 'ecs'
};
const groupConfigTwo = {
  match: '^two',
  tags:  ['two', 'second'],
};

describe('config resolving', () => {
  let configResolver: ConfigResolver;

  beforeEach(() => {
    configResolver = new ConfigResolver({
      groups: [groupConfigOne, groupConfigTwo]
    });
  });

  it('finds config by matching group name', () => {
    let config = configResolver.resolve('one-group-name');
    expect(config).toEqual(groupConfigOne);
  });

  it('throws error if it cant find a matching config', () => {
    let call = () => configResolver.resolve('no-match-group-name');

    expect(call).toThrowError(`Can't find config for group no-match-group-name`);
  });
});
