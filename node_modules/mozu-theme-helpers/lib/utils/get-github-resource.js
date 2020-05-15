"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getGithubResource;

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _slug = require("./slug");

var _slug2 = _interopRequireDefault(_slug);

var _stream = require("stream");

var _stream2 = _interopRequireDefault(_stream);

var _rimraf = require("rimraf");

var _rimraf2 = _interopRequireDefault(_rimraf);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DIRNAME = ".mozu.gh-cache";
// import tunnelAgent from "tunnel-agent";

var HOMEDIR = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

var USER_AGENT = "Mozu Theme Utilities";

function getGithubResource(_ref) {
  var pathname = _ref.pathname;
  var _ref$cache = _ref.cache;
  var cache = _ref$cache === undefined ? true : _ref$cache;

  var outStream = new _stream2.default.PassThrough();
  var cacheDir = _path2.default.join(HOMEDIR, DIRNAME, (0, _slug2.default)(pathname));
  var cacheFile = null;
  var etag = null;
  var fileContentsStream = null;
  try {
    cacheFile = _fs2.default.readdirSync(cacheDir).filter(function (f) {
      return f.indexOf('etag-') === 0;
    })[0];
    etag = cacheFile.replace(/^etag-/, '');
    fileContentsStream = _fs2.default.createReadStream(_path2.default.join(cacheDir, cacheFile));
  } catch (e) {}
  var config = {
    url: 'https://api.github.com' + pathname,
    headers: {
      'User-Agent': USER_AGENT
    }
  };
  if (process.env.USE_FIDDLER) {
    config.proxy = 'http://127.0.0.1:8888';
    config.strictSSL = false;
  }
  if (cache && fileContentsStream && etag) {
    config.headers['If-None-Match'] = "\"" + etag + "\"";
  }
  var req = (0, _request2.default)(config);

  req.on('error', function (err) {
    outStream.emit('error', err);
  });

  req.on('response', function (res) {
    if (res.statusCode === 403 && res.headers['x-ratelimit-remaining'].toString() === "0") {
      outStream.emit('error', new Error("GitHub rate limit exceeded. Please report this issue to Mozu Enterprise Support. You may try again in " + Math.ceil((Number(res.headers['x-ratelimit-reset']) * 1000 - new Date().getTime()) / 60000) + " minutes."));
    } else if (res.statusCode === 304) {
      fileContentsStream.pipe(outStream);
    } else {
      (function () {
        if (cacheFile && fileContentsStream) _rimraf2.default.sync(_path2.default.join(cacheDir, cacheFile));
        var newCacheFileName = _path2.default.join(cacheDir, 'etag-' + res.headers.etag.replace(/"/g, ''));
        _mkdirp2.default.sync(cacheDir);
        req.pipe(_fs2.default.createWriteStream(newCacheFileName)).on('end', function () {
          _fs2.default.chmodSync(newCacheFileName, '666');
          if (process.env.DEBUG && process.env.DEBUG.indexOf('thmaa') !== -1) console.log('cache complete');
        });
        req.pipe(outStream);
      })();
    }
  });

  return outStream;
}