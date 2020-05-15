'use strict';
import createTask from './utils/create-task';

import check from './commands/check';
import compile from './commands/compile';

let commands = { check, compile };

module.exports = function(name, config) {

  let task = createTask();

  if (!commands[name]) {

    task.fail(`Unrecognized command \`${name}\`.`);

  } else if ((typeof config) !== "object" ) {

    task.fail('You must pass a config object as the second argument.');

  } else {

    let command = commands[name];

    if (config._args) {
      return command(task, command.transformArguments(config));
    } else {
      return command(task, config);
    }

  }

};
