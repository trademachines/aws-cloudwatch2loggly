'use strict';

module.exports = (group, stream, rawEvent, cb) => {
  return {
    timestamp: new Date(rawEvent.timestamp).toISOString(),
    message: rawEvent.message.trim(),
    logGroup: group,
    logStream: stream,
  };
};
