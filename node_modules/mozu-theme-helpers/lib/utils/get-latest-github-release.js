"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (repo, _ref) {
  var _ref$versionRange = _ref.versionRange;
  var versionRange = _ref$versionRange === undefined ? '*' : _ref$versionRange;
  var _ref$cache = _ref.cache;
  var cache = _ref$cache === undefined ? true : _ref$cache;

  return new Promise(function (resolve, reject) {
    var releaseStream = (0, _getGithubReleases2.default)(repo, { versionRange: versionRange, cache: cache });
    releaseStream.on('error', reject);
    releaseStream.pipe((0, _concatStream2.default)(function (releases) {
      if (!releases || releases.length === 0) {
        return resolve(null);
      }
      var qualifyingVersions = releases.map(function (_ref2) {
        var tag_name = _ref2.tag_name;
        return _semver2.default.clean(tag_name);
      });
      var maxVersion = _semver2.default.maxSatisfying(qualifyingVersions, versionRange.toString());
      // send back the release object matching the max satisfying version,
      // and the version string itself
      resolve(releases[qualifyingVersions.indexOf(maxVersion)]);
    }));
  });
};

var _getGithubReleases = require("./get-github-releases");

var _getGithubReleases2 = _interopRequireDefault(_getGithubReleases);

var _concatStream = require("concat-stream");

var _concatStream2 = _interopRequireDefault(_concatStream);

var _semver = require("semver");

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }