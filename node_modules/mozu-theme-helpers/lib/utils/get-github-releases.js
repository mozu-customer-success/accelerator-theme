"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getReleases;

var _getGithubResource = require("./get-github-resource");

var _getGithubResource2 = _interopRequireDefault(_getGithubResource);

var _JSONStream = require("JSONStream");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getReleases(repo, _ref) {
  var _ref$cache = _ref.cache;
  var cache = _ref$cache === undefined ? true : _ref$cache;

  return (0, _getGithubResource2.default)({
    pathname: "/repos/" + repo + "/releases",
    cache: cache
  }).pipe((0, _JSONStream.parse)());
}