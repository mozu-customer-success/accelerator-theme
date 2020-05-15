'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchRemoteTags;

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _git = require('./git');

var _git2 = _interopRequireDefault(_git);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fetchRemoteTags() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return (0, _git2.default)('ls-remote --tags basetheme', 'Detecting base theme versions', {
    quiet: opts.hasOwnProperty('quiet') ? opts.quiet : true,
    logger: opts.logger
  }).then(function (tags) {
    var uniques = new Set();
    return tags.trim().split('\n').map(function (l) {
      var m = l.match(/([0-9A-Fa-f]+)\trefs\/tags\/v?([^\^]+)\^\{\}/i);
      if (m) {
        var version = _semver2.default.clean(m[2]);
        if (!uniques.has(version)) {
          uniques.add(version);
          return {
            commit: m[1],
            version: version
          };
        }
      }
    }).filter(opts.prerelease ? function (x) {
      return !!x && !!x.version;
    } : function (x) {
      return !!x && !!x.version && ! ~x.version.indexOf('-');
    }).sort(function (x, y) {
      return _semver2.default.rcompare(x.version, y.version);
    });
  });
};