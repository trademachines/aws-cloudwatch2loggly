'use strict';

const parseLogEvent = (group, stream, rawEvent, cb) => {
  let event = {
    timestamp: new Date(rawEvent.timestamp).toISOString(),
    message: rawEvent.message.trim(),
    logGroup: group,
    logStream: stream,
  };

  if (stream.includes('/')) {
    const parts = stream.split('/');

    event.dockerTaskId    = parts.pop();
    event.dockerContainer = parts.pop();
    event.dockerPrefix    = parts.join('/');
  }

  cb(null, event);
};

module.exports = parseLogEvent;
