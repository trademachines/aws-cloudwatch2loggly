'use strict';

const behaviours = require('./behaviour');

describe('behaviours', () => {
  describe('ecs behaviour', () => {
    it('adds infos', () => {
      const stream     = 'prefix/with/slashes/container/id';
      const additional = behaviours.ecs(null, stream, null);

      expect(additional).toEqual({
        dockerPrefix: 'prefix/with/slashes',
        dockerContainer: 'container',
        dockerTaskId: 'id',
      });
    });
  });
});
