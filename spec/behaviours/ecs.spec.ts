import { EcsBehaviour } from '../../src/behaviours';

describe('behaviours', () => {
  describe('ecs behaviour', () => {
    let ecsBehaviour: EcsBehaviour;

    beforeEach(() => {
      ecsBehaviour = new EcsBehaviour();
    });

    it('adds infos', () => {
      const stream = 'prefix/with/slashes/container/id';
      const data   = ecsBehaviour.getData(null, stream, null);

      expect(data).toEqual({
        dockerPrefix:    'prefix/with/slashes',
        dockerContainer: 'container',
        dockerTaskId:    'id',
      });
    });

    it('does add infos for stream names without slash', () => {
      const stream = 'random-stream-name';
      const data   = ecsBehaviour.getData(null, stream, null);

      expect(data).toEqual({});
    })
  });
});
