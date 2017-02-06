'use strict';

const _           = require('lodash');
const async       = require('neo-async');
const zlib        = require('zlib');
const http        = require('http');
const eventParser = require('./event-parser');
const behaviours  = require('./behaviour');

let groupConfigs = {};

const getGroupConfig = (cfg, group) => {
  if (!groupConfigs[group]) {
    const groupCfg = Object.assign(
      {}, cfg,
      _.get(cfg, `__groupMap.${group}`, {})
    );

    groupConfigs[group] = {
      behaviour: groupCfg.behaviour,
      http: {
        hostname: groupCfg.host,
        path: `/bulk/${groupCfg.token}/tag/${encodeURIComponent(
          groupCfg.tags)}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      }
    };
  }

  return groupConfigs[group];
};

const buildHttpOptions = (cfg, group, contentLength) => {
  let current = Object.assign({}, getGroupConfig(cfg, group)).http;

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

  const unzipped    = zlib.gunzipSync(new Buffer(event.awslogs.data, 'base64'));
  const json        = unzipped.toString('ascii');
  let parsed;

  try {
    parsed      = JSON.parse(json);
  } catch (e) {
    console.log(`Can not parse JSON from ${json}`);
    return cb(e);
  }

  const eventConfig = getGroupConfig(cfg, parsed.logGroup);
  let parsers       = [eventParser];

  if (_.has(behaviours, eventConfig.behaviour)) {
    parsers.push(behaviours[eventConfig.behaviour]);
  }

  parsers = _.map(parsers,
    (p) => _.partial(p, parsed.logGroup, parsed.logStream)
  );

  async.waterfall([
      (cb) => {
        async.map(
          parsed.logEvents,
          (ev, cb) => {
            async.reduce(
              parsers, {},
              (memo, p, cb) => cb(null, Object.assign(memo, p(ev))),
              cb
            );
          },
          cb
        );
      },
      (events, cb) => {
        sendToLoggly(cfg, parsed.logGroup, events, cb);
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
  groupConfigs = {};
};
module.exports.sendToLoggly     = sendToLoggly;
module.exports.buildHttpOptions = buildHttpOptions;
module.exports.getGroupConfig   = getGroupConfig;
