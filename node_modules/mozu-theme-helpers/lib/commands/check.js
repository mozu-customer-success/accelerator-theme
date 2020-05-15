'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _semver = require("semver");

var _semver2 = _interopRequireDefault(_semver);

var _getThemeDir = require("../utils/get-theme-dir");

var _getThemeDir2 = _interopRequireDefault(_getThemeDir);

var _metadata = require("../utils/metadata");

var _metadata2 = _interopRequireDefault(_metadata);

var _git = require("../utils/git");

var _git2 = _interopRequireDefault(_git);

var _gitFetchRemoteTags = require("../utils/git-fetch-remote-tags");

var _gitFetchRemoteTags2 = _interopRequireDefault(_gitFetchRemoteTags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findWhere(coll, props) {
  var _loop = function _loop(i) {
    if (Object.keys(props).every(function (prop) {
      return coll[i][prop] === props[prop];
    })) {
      return {
        v: coll[i]
      };
    }
  };

  for (var i = 0; i < coll.length; i++) {
    var _ret = _loop(i);

    if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
  }
}

var check = function check(task, _ref) {
  var dir = _ref.dir;
  var channelOverride = _ref.channelOverride;

  var themeDir = (0, _getThemeDir2.default)(dir);

  var pkg = _metadata2.default.read(themeDir, 'package');
  var theme = _metadata2.default.read(themeDir, 'theme');

  if (theme.about.extends) {
    return task.fail('Themes that use the `about.extends` legacy option are ' + 'not compatible with this version of the theme helpers.');
  }

  var gopts = {
    logger: function logger(x) {
      return task.info(x);
    },
    quiet: true
  };

  var channel = channelOverride || theme.about.baseThemeChannel;
  var fallbackCommit = theme.about.baseThemeVersion && theme.about.baseThemeVersion.commit;

  var updateBaseThemeVersionInThemeJson = false;

  var remoteTags = [];

  (0, _git2.default)('remote show basetheme', 'Checking if base theme remote exists...', gopts).catch(function () {
    if (!theme.about.baseTheme) {
      task.fail('No theme repo specified; cannot check for updates.\n\nPlease ' + 'add a `baseTheme` property to the `about` section of your ' + '`theme.json` file, whose value is the URL of a Git repository ' + 'containing the base theme of this theme. If this theme extends ' + 'the Mozu Core Theme, then the line should say:\n\n  "extends": ' + '"https://github.com/mozu/core-theme"\n\n');
    } else {
      return (0, _git2.default)('remote add basetheme ' + theme.about.baseTheme, 'Base theme specified in theme.json. Adding remote to ' + 'git repository', gopts);
    }
  }).then(function () {
    return (0, _git2.default)('config remote.basetheme.tagopt --no-tags', 'Ensuring that no tags are downloaded from base theme', gopts);
  }).then(function () {
    return (0, _git2.default)('remote update basetheme', 'Updating basetheme remote', gopts);
  }).then(function () {
    return (0, _git2.default)('merge-base master basetheme/master', 'Getting most recently merged basetheme commit', gopts);
  }).catch(function () {
    if (!fallbackCommit) {
      throw new Error('Could not find a merge base with the base theme ' + 'repository, or a baseThemeVersion specified in ' + 'theme.json. Please check your `basetheme` remote, ' + 'or the `baseTheme` and `baseThemeVersion` properties ' + 'in your `theme.json` file.');
    }
    return fallbackCommit;
  }).then(function (mergeBase) {
    if (mergeBase !== fallbackCommit) {
      updateBaseThemeVersionInThemeJson = mergeBase;
    }
    return (0, _git2.default)("--no-pager log --date=rfc --pretty=%ad||||%H||||%s " + (mergeBase.trim() + "..basetheme/master"), "Getting all commits since most recent merge base", gopts);
  }).then(function (newCommitsRaw) {
    return newCommitsRaw.split('\n').filter(function (line) {
      return !!line.trim();
    }).map(function (line) {
      var parts = line.split('||||').map(function (p) {
        return p.trim();
      });
      if (parts.length > 3) {
        // must have had a delimiter char in the commit message. fix it:
        parts = [parts[0], parts[2], parts.slice(2).join('||||')];
      }
      var versionName = parts[2];
      if (channel !== 'edge') {
        var match = channel === "edge" ? parts[2] : parts[2].match(/\b\d+\.\d+\.\d+(\-\S+)?/g);
        if (match && match.length === 1) {
          versionName = _semver2.default.clean(match[0]);
        }
      }
      return {
        date: new Date(parts[0]),
        commit: parts[1],
        name: versionName
      };
    });
  }).then(function (allNewCommits) {
    if (channel === 'edge') {
      task.warn('This theme is configured in `theme.json` to be connected ' + 'to the "edge" channel of its base theme. This means ' + 'that its build process will notify about any new commits ' + 'in the base theme, instead of just any new versions.');
      return allNewCommits;
    } else {
      return (0, _gitFetchRemoteTags2.default)({
        prerelease: channel === 'prerelease',
        logger: gopts.logger
      }).then(function (tags) {
        remoteTags = tags;
        return allNewCommits.filter(function (c) {
          return remoteTags.some(function (t) {
            return t.commit === c.commit;
          });
        });
      });
    }
  }).then(function (newCommits) {
    var normalizeDateLength = function normalizeDateLength(s, l) {
      while (s.length < l) {
        s += ' ';
      }return s;
    };
    if (newCommits.length > 0) {
      var formattedCommits = newCommits.reverse().map(function (t) {
        return _chalk2.default.cyan(normalizeDateLength(t.date.toLocaleString(), 23)) + ("  " + _chalk2.default.bold.yellow(t.name) + " (commit: " + t.commit.slice(0, 9) + ")");
      });
      if (channel === 'edge') {
        task.warn(_chalk2.default.green.bold("This theme is " + newCommits.length + " " + "commits behind its base theme.") + "\n\n## Unmerged commits:\n\n" + formattedCommits.join('\n') + _chalk2.default.green.bold("\n\n Run `git merge basetheme/master` to merge these commits."));
      } else {
        if (channel === 'prerelease') {
          task.warn('This theme is configured in `theme.json` to be connected ' + 'to the "prerelease" channel of its base theme. This means ' + 'that its build process will notify about prerelease tags ' + 'in the base theme, instead of just stable versions.');
        }
        task.warn(_chalk2.default.green.bold('\nThere are new versions available! \n\n') + formattedCommits.join('\n') + '\n\nTo merge a new version, run `git merge <commit>`, where ' + '<commit> is the commit ID corresponding to the version you ' + 'would like to begin to merge.\n');
        task.warn(_chalk2.default.gray('You cannot merge the tag directly, because the default ' + 'configuration does not fetch tags from the base theme ' + 'repository, to avoid conflicts with your own tags.'));
      }
    } else {
      task.info(_chalk2.default.green('Your theme is up to date with its base theme.'));
    }
    if (updateBaseThemeVersionInThemeJson) {
      if (!fallbackCommit) {
        task.warn('Saving detected merge base in theme.json as baseThemeVersion.');
      } else {
        task.warn('The detected *merge base* is your repository is different than ' + 'the baseThemeVersion detected in your theme.json. Updating ' + 'theme.json to reflect the repository state.');
      }
      var baseThemeVersion = {
        commit: updateBaseThemeVersionInThemeJson
      };
      if (channel === 'edge') {
        baseThemeVersion.version = 'HEAD';
      } else {
        var foundBTV = findWhere(remoteTags, baseThemeVersion);
        if (foundBTV) {
          baseThemeVersion = foundBTV;
        } else {
          task.warn('Could not find the current merge base among tags. Assuming ' + 'a manual merge was done from a non-tag; please consider ' + 'changing the `baseThemeChannel` in theme.json to "edge".');
        }
      }
      theme.about.baseThemeVersion = baseThemeVersion;
      try {
        _metadata2.default.write(themeDir, 'theme', theme);
      } catch (e) {
        task.warn('Could not write new baseThemeVersion to theme.json. ' + e);
      }
      task.info('Successfully wrote new baseThemeVersion to theme.json: ' + JSON.stringify(baseThemeVersion));
    }
    task.done();
  }).catch(task.fail);

  return task;
};

check.transformArguments = function (_ref2) {
  var options = _ref2.options;
  var _args = _ref2._args;

  options.dir = _args[0] || process.cwd();
  return options;
};

check._doc = {
  args: "<path>",
  description: "Check for new versions of the base theme..",
  options: {
    'channelOverride': 'Release channel the theme is on. Can be "stable", "prerelease", or "edge".'
  }
};

exports.default = check;