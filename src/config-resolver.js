'use strict';

const async = require('neo-async');
const _     = require('lodash');

let cachedConfig;

const getSecuredValue = (obj) => {
  const keys = Object.keys(obj);
  if (1 === keys.length && 'secure' === keys[0]) {
    return obj.secure;
  }
};

const resolve = (kms, cfg, cb) => {
  switch (true) {
    case _.isArray(cfg):
      async.map(cfg, _.partial(resolve, kms), cb);
      break;
    case _.isPlainObject(cfg):
      let securedValue;

      if (securedValue = getSecuredValue(cfg)) {
        const params = {
          CiphertextBlob: new Buffer(securedValue, 'base64'),
        };

        kms.decrypt(params, (err, data) => {
          if (err) {
            return cb(err);
          }

          return cb(null, data.Plaintext.toString('ascii'));
        });
      } else {
        async.mapValues(cfg, (v, k, cb) => resolve(kms, v, cb), cb);
      }
      break;
    default:
      cb(null, cfg);
  }
};

module.exports = (config, kms, callback) => {
  return (ev, ctx, cb) => {
    if (cachedConfig) {
      return callback(null, cachedConfig, ev, ctx, cb);
    }

    config.getConfig(ctx, (err, cfg) => {
      if (err) {
        return callback(err, null, ev, ctx, cb);
      }

      resolve(kms, cfg, (err, c) => {
        if (!err) {
          cachedConfig = c;
        }

        callback(err, c, ev, ctx, cb);
      });
    });
  };
};

module.exports.reset   = () => {
  cachedConfig = null;
};
module.exports.resolve = resolve;
