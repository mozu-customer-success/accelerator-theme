var fs = require('fs');
var path = require('path');
var needle = require('needle');
var LATEST_DEFS_URL = "http://aus02niserv001.dev.volusion.com/Mozu.InstalledApplications.WebApi/platform/extensions/actionsManifest";

var getActionDefs = module.exports = function(opts) {
  opts = opts || {};
  opts.url = opts.url || LATEST_DEFS_URL;

  return new Promise(function(resolve, reject) {
    needle.get(opts.url, { parse_response: false }, function(error, response) {
      if (error) {
        if (error.code === "ENOTFOUND") {
          return retrievalError("The domain was not found. This script will only run successfully on an internal Mozu development network or VPN.");
        } else {
          return retrievalError(error);
        }
      }

      if (response.statusCode !== 200) {
        return retrievalError(response.body);
      }

      var actions;
      try {
        actions = JSON.parse(response.body);
      } catch(e) {
        return reject(new Error("Parsing of definitions response as JSON failed with: " + e + ", body was " + response.body));
      }

      var domains = actions.reduce(function(result, action) {
        return (action.domain && result.indexOf(action.domain) === -1) ? result.concat(action.domain) : result;
      }, []);

      resolve({
        domains: domains,
        actions: actions
      });

    });

    function retrievalError(e) {
      reject(new Error("Retrieval of definitions at " + opts.url + " failed: ", e));
    }

  });
};

getActionDefs.LATEST_DEFS_URL = LATEST_DEFS_URL;