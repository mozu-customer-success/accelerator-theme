"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _rimraf = require("rimraf");

var _rimraf2 = _interopRequireDefault(_rimraf);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _zlib = require("zlib");

var _zlib2 = _interopRequireDefault(_zlib);

var _tar = require("tar");

var _tar2 = _interopRequireDefault(_tar);

var _getThemeDir = require("../utils/get-theme-dir");

var _getThemeDir2 = _interopRequireDefault(_getThemeDir);

var _metadata = require("../utils/metadata");

var _metadata2 = _interopRequireDefault(_metadata);

var _getGithubResource = require("../utils/get-github-resource");

var _getGithubResource2 = _interopRequireDefault(_getGithubResource);

var _slug = require("../utils/slug");

var _slug2 = _interopRequireDefault(_slug);

var _getLatestGithubRelease = require("../utils/get-latest-github-release");

var _getLatestGithubRelease2 = _interopRequireDefault(_getLatestGithubRelease);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var update = function update(_ref, log, cb) {
  var dir = _ref.dir;
  var repo = _ref.repo;
  var themeName = _ref.themeName;
  var _ref$cache = _ref.cache;
  var cache = _ref$cache === undefined ? true : _ref$cache;
  var versionRange = _ref.versionRange;

  var themeDir = (0, _getThemeDir2.default)(dir);

  if (!themeDir) {
    return cb(new Error("Not inside a theme directory. Please supply a theme directory whose references I should update."));
  }

  if (!repo || !themeName) {
    var pkg = _metadata2.default.read(themeDir, 'package');
    var theme = _metadata2.default.read(themeDir, 'theme');
    repo = pkg.config.baseThemeRepo;
    themeName = pkg.config.baseTheme;
    versionRange = versionRange || pkg.config.baseThemeVersion;
    if (theme.about.extends !== pkg.config.baseTheme) {
      return cb(new Error("Theme extends " + theme.about.extends + " but package.json instead refers to a repo for " + pkg.config.baseTheme + "."));
    }
  }

  if (!repo) {
    return cb(new Error("No theme repo specified; cannot check for updates."));
  }

  var refDir = _path2.default.resolve(themeDir, 'references', (0, _slug2.default)(themeName));

  (0, _rimraf2.default)(refDir, function (err) {
    if (err) return cb(err);
    (0, _mkdirp2.default)(refDir, function (err) {
      if (err) return cb(err);

      (0, _getLatestGithubRelease2.default)(repo, { cache: cache, versionRange: versionRange || '*' }).then(function (release) {
        var releaseUrl = release.tarball_url.replace('https://api.github.com', '');

        var tarballStream = (0, _getGithubResource2.default)({
          pathname: releaseUrl
        }, { cache: cache });

        tarballStream.on('error', cb);

        var fileStream = tarballStream.pipe(_zlib2.default.createGunzip()).pipe(_tar2.default.Extract({ path: refDir, strip: 1 }));

        fileStream.on('error', cb);

        fileStream.on('end', function () {
          (function walk(referenceDir, templatedir) {
            var inheritedDir,
                fileList = _fs2.default.readdirSync(referenceDir).map(function (filename) {
              // if (ignore[filename]) return false;
              var stats = _fs2.default.statSync(_path2.default.resolve(referenceDir, filename));
              if (stats.isDirectory()) {
                var _dir = _path2.default.resolve(templatedir, filename);
                if (!_fs2.default.existsSync(_dir)) _fs2.default.mkdirSync(_dir);
                walk(_path2.default.resolve(referenceDir, filename), _dir);
                return false;
              } else if (stats.isFile() && !_fs2.default.existsSync(_path2.default.resolve(templatedir, filename))) {
                return filename;
              }
            }).filter(function (x) {
              return x;
            });

            if (fileList.length > 0) {
              _fs2.default.writeFileSync(_path2.default.resolve(templatedir, '.inherited'), fileList.join('\n'));
            }
          })(refDir, themeDir);

          log.info("Base theme update complete.");
          cb(null, "Base theme update complete.");
        });
      }).catch(cb);
    });
  });
};

update.transformArguments = function (_ref2) {
  var options = _ref2.options;
  var _args = _ref2._args;

  options.dir = _args[0] || process.cwd();
  return options;
};

update._doc = {
  args: '<path>',
  description: 'Update base theme in references folder.',
  options: {
    '--no-cache': 'Skip the local cache. This results in a call out to the remote repository every time, instead of relying on cache.'
  }
};

exports.default = update;