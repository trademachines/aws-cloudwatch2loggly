'use strict';

exports.ecs  = (group, stream, rawEvent) => {
  let data = {};

  if (stream.includes('/')) {
    const parts = stream.split('/');

    data.dockerTaskId    = parts.pop();
    data.dockerContainer = parts.pop();
    data.dockerPrefix    = parts.join('/');
  }

  return data;
};

// exports.lambda = () => {};
