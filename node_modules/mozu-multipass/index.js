var fs = require('fs');
var HomedirStorage = require('./homedir-storage');
var generateCacheKey = require('./generate-cache-key');
var isExpired = require('./is-ticket-expired');


function preSerialize(ticket) {
  // just store tokens and expirations
  return [
    'accessToken',
    'accessTokenExpiration',
    'refreshToken',
    'refreshTokenExpiration'
  ].reduce(function(memo, key) {
    memo[key] = ticket[key];
    return memo;
  }, {});
}

function deSerialize(json) {
  return Object.keys(json).reduce(function(memo, p) {
    memo[p] = (p.indexOf('Expiration') !== -1) ? new Date(json[p]) : json[p];
    return memo;
  });
}

var Multipass = function Multipass(storage) {
  storage = storage || HomedirStorage(fs);
  return Object.create({
    get: function(claimType, context, callback) {
      var cacheKey;
      try {
        cacheKey = generateCacheKey(claimType, context);
      } catch(e) {
        return callback(e);
      }
      storage.retrieve(cacheKey, function(err, ticket) {
        if (!ticket || isExpired(ticket)) {
          callback(err);
        } else {
          callback(null, ticket);
        }
      });
    },
    set: function(claimType, context, ticket, callback) {
      var cacheKey;
      try {
        cacheKey = generateCacheKey(claimType, context);
      } catch(e) {
        return callback(e);
      }
      storage.save(cacheKey, preSerialize(ticket), callback);
    },
    remove: function(claimType, context, callback) {
      var cacheKey;
      try {
        cacheKey = generateCacheKey(claimType, context);
      } catch(e) {
        return callback(e);
      }
      storage.save(cacheKey, null, callback);
    }
  }, {
    storage: {
      value: storage
    },
    constructor: {
      value: Multipass, // just for console logging obviousness
      writable: false,
      enumerable: false,
      configurable: false
    }
  });
}

module.exports = function(client, storage) {
  return client.authenticationStorage = Multipass(storage);
}
