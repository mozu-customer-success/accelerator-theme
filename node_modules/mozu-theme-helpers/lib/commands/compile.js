'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _compiler = require("../utils/compiler");

var _compiler2 = _interopRequireDefault(_compiler);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _slug = require("../utils/slug");

var _slug2 = _interopRequireDefault(_slug);

var _getThemeDir = require("../utils/get-theme-dir");

var _getThemeDir2 = _interopRequireDefault(_getThemeDir);

var _metadata = require("../utils/metadata");

var _metadata2 = _interopRequireDefault(_metadata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var compile = function compile(task, opts) {

  opts.ignore = opts.ignore || [];

  var themeDir = (0, _getThemeDir2.default)(opts.dir);

  if (!themeDir) {
    return task.fail("Not inside a theme directory. Please supply a theme directory to compile.");
  }

  var base = _metadata2.default.read(themeDir, 'theme').about.extends;

  if (base) opts.manualancestry = [_path2.default.resolve(themeDir, 'references', (0, _slug2.default)(base))];

  opts.ignore.push('/references', '\\.git', 'node_modules', '^/resources', '^/tasks', '\\.zip$');

  if (opts.verbose) opts.logLevel = 6;

  var job = (0, _compiler2.default)(themeDir, opts, function (err) {
    if (err) {
      task.fail(err);
    } else {
      task.info("Theme compilation complete.");
      task.done();
    }
  });

  job.on('log', function (str, sev) {
    switch (sev) {
      case "error":
        job.cleanup(function () {
          return task.fail("Compiler failed: " + str);
        });
        break;
      case "warning":
        job.cleanup(function () {
          return task.fail("Compiler warning: " + str);
        });
        break;
      default:
        task.info("Compiler output: " + str);
    }
  });

  return task;
};

compile.transformArguments = function (_ref) {
  var options = _ref.options;
  var _args = _ref._args;

  options.dir = _args[0] || process.cwd();
};

compile._doc = {
  args: '<path>',
  description: 'Compile theme scripts, respecting inheritance.',
  options: {
    '--ignore': 'Speed up! Specify a pattern of files and directories to ignore when copying, relative to root. Defaults to ".git, node_modules"',
    '--dest': 'Specify a destination other than the default /compiled/scripts directory of your theme.',
    '--verbose': 'Talk a lot.',
    '--quiet': 'Don\'t talk at all.'
  }
};

exports.default = compile;