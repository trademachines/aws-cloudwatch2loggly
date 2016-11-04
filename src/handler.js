'use strict';

const _     = require('lodash');
const async = require('neo-async');
const zlib  = require('zlib');
const http  = require('http');

let httpOptions = null;

const buildHttpOptions = (cfg, contentLength) => {
  if (!httpOptions) {
    httpOptions = {
      hostname: cfg.host,
      path: '/bulk/' + cfg.token + '/tag/' + encodeURIComponent(cfg.tags),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': contentLength,
      },
    };
  }

  let current                       = Object.assign({}, httpOptions);
  current.headers['Content-Length'] = contentLength;

  return current;
};

const parseLogEvent = (group, stream, rawEvent, cb) => {
  let event = {
    timestamp: new Date(rawEvent.timestamp).toISOString(),
    message: rawEvent.message.trim(),
    logGroup: group,
    logStream: stream,
  };

  if (stream.includes('/')) {
    const parts = stream.split('/', 3);

    event.dockerPrefix    = parts[0];
    event.dockerContainer = parts[1];
    event.dockerTaskId    = parts[2];
  }

  cb(null, event);
};

const httpRequest = (options, data, cb) => {
  const request = http.request(options, (response) => {
    let answer = '';

    response.on('data', (chunk) => answer += chunk.toString());
    response.on('end', () => {
      try {
        cb(null, answer);
      } catch (e) {
        cb(e);
      }
    });
  });

  request.on('error', cb);
  request.write(data);
  request.end();
};

const sendToLoggly = (cfg, events, cb) => {
  const zehEvent = events.map(JSON.stringify).join('\n');
  const options  = buildHttpOptions(cfg, zehEvent.length);

  httpRequest(options, zehEvent, cb);
};

module.exports = (err, cfg, event, context, cb) => {
  if (err) {
    return cb(err);
  }

  async.waterfall([
      (cb) => {
        cb(null, new Buffer(event.awslogs.data, 'base64'));
      },
      zlib.gunzip,
      (parsed, cb) => {
        cb(null, JSON.parse(parsed.toString('ascii')));
      },
      (parsed, cb) => {
        async.map(
          parsed.logEvents,
          _.partial(parseLogEvent, parsed.logGroup, parsed.logStream),
          cb
        );
      },
      _.partial(sendToLoggly, cfg),
    ],
    (err) => {
      if (err) {
        return cb(err);
      }

      cb();
    }
  );
};

module.exports.reset            = () => {
  httpOptions = null;
};
module.exports.parseLogEvent    = parseLogEvent;
module.exports.sendToLoggly     = sendToLoggly;
module.exports.buildHttpOptions = buildHttpOptions;
