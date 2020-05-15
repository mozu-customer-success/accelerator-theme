'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = git;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function git(command, reason, options) {
  var text = undefined;
  var args = undefined;
  if (Array.isArray(command)) {
    text = command.join(' ');
    args = command;
  } else {
    text = command;
    args = command.split(' ');
  }
  var log = options && options.logger || console.log;
  return new Promise(function (resolve, reject) {
    try {
      (function () {
        log(reason + ': \n      ' + _chalk2.default.yellow('git ' + text), {
          markdown: false
        });
        var opts = Object.assign({
          encoding: 'utf8'
        }, options);
        var quiet = opts.quiet;
        delete opts.quiet; // in case that option ever affects node
        var proc = _child_process2.default.spawn('git', args, opts);
        var output = '';
        var errput = '';
        if (proc.stdout) {
          proc.stdout.on('data', function (chunk) {
            return output += chunk;
          });
        }
        if (proc.stderr) {
          proc.stderr.on('data', function (chunk) {
            return errput += chunk;
          });
        }
        proc.on('close', function (code) {
          if (code !== 0) {
            reject(new Error('Failed at task "' + text + '": ' + errput));
          } else {
            var trimmedOutput = output.trim();
            if (!quiet) log(trimmedOutput);
            resolve(trimmedOutput);
          }
        });
      })();
    } catch (e) {
      reject(new Error('Failed at task "' + text + '": ' + e.message));
    }
  });
}