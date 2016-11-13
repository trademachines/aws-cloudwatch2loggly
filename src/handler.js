'use strict';

const _           = require('lodash');
const async       = require('neo-async');
const zlib        = require('zlib');
const http        = require('http');
const eventParser = require('./event-parser');

let httpOptions = {};

const buildHttpOptions = (cfg, group, contentLength) => {
  if (!httpOptions[group]) {
    let groupCfg = !!cfg.__groupMap
      ? cfg.__groupMap[group]
      : {};
    groupCfg     = groupCfg ? groupCfg : {};
    groupCfg     = Object.assign({}, cfg, groupCfg);

    httpOptions[group] = {
      hostname: groupCfg.host,
      path: `/bulk/${groupCfg.token}/tag/${encodeURIComponent(groupCfg.tags)}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': contentLength,
      },
    };
  }

  let current = Object.assign({}, httpOptions[group]);

  current.headers['Content-Length'] = contentLength;

  return current;
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

const sendToLoggly = (cfg, group, events, cb) => {
  const zehEvent = events.map(JSON.stringify).join('\n');
  const options  = buildHttpOptions(cfg, group, zehEvent.length);

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
          _.partial(eventParser, parsed.logGroup, parsed.logStream),
          (err, events) => {
            cb(err, {group: parsed.logGroup, events: events});
          }
        );
      },
      (parsed, cb) => {
        sendToLoggly(cfg, parsed.group, parsed.events, cb);
      },
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
  httpOptions = {};
};
module.exports.sendToLoggly     = sendToLoggly;
module.exports.buildHttpOptions = buildHttpOptions;
