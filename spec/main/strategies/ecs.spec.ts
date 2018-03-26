import { EcsStrategy } from '../../../src/main/strategies';

describe('ecs strategy', () => {
  let strategy: EcsStrategy;

  beforeEach(() => {
    strategy = new EcsStrategy();
  });

  it('adds infos', () => {
    const stream = 'prefix/with/slashes/container/id';
    const data   = strategy.from({ stream: stream, group: null, event: null });

    expect(data).toEqual(jasmine.objectContaining({
      dockerPrefix:    'prefix/with/slashes',
      dockerContainer: 'container',
      dockerTaskId:    'id',
    }));
  });

  it('does add infos for stream names without slash', () => {
    const stream = 'random-stream-name';
    const data   = strategy.from({ stream: stream, group: null, event: null });
    const keys   = Object.keys(data);

    expect(keys).not.toContain('dockerPrefix');
    expect(keys).not.toContain('dockerContainer');
    expect(keys).not.toContain('dockerTaskId');
  });
});
