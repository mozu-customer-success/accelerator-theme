'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createTask = require('./utils/create-task');

var _createTask2 = _interopRequireDefault(_createTask);

var _check = require('./commands/check');

var _check2 = _interopRequireDefault(_check);

var _compile = require('./commands/compile');

var _compile2 = _interopRequireDefault(_compile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var commands = { check: _check2.default, compile: _compile2.default };

module.exports = function (name, config) {

  var task = (0, _createTask2.default)();

  if (!commands[name]) {

    task.fail('Unrecognized command `' + name + '`.');
  } else if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) !== "object") {

    task.fail('You must pass a config object as the second argument.');
  } else {

    var command = commands[name];

    if (config._args) {
      return command(task, command.transformArguments(config));
    } else {
      return command(task, config);
    }
  }
};