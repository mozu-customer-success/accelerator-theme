'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createTask;

var _events = require('events');

function createTask() {
  var l = new _events.EventEmitter();
  l.info = function (str) {
    return l.emit('info', str);
  };
  l.warn = function (str) {
    return l.emit('warn', str);
  };
  l.fail = function (str) {
    var msg = 'mozu-theme-helpers: ';
    if (typeof str === "string") {
      msg += str;
    } else if (str && str.message) {
      msg += str.message;
      if (str.stack) {
        msg += "\n" + str.stack;
      }
    } else {
      msg += str && str.toString() || 'Unknown error!';
    }
    l.emit('error', new Error(msg));
  };
  l.done = function (x) {
    return l.emit('done', x);
  };
  return l;
}