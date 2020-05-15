import chalk from 'chalk';
import childProcess from 'child_process';

export default function git(command, reason, options) {
  let text;
  let args;
  if (Array.isArray(command)) {
    text = command.join(' ');
    args = command;
  } else {
    text = command;
    args = command.split(' ');
  }
  let log = options && options.logger || console.log;
  return new Promise((resolve, reject) => {
    try {
      log(
        reason + ': \n      ' + chalk.yellow('git ' + text), {
        markdown: false
      });
      let opts = Object.assign({
        encoding: 'utf8',
      }, options);
      let quiet = opts.quiet;
      delete opts.quiet; // in case that option ever affects node
      let proc = childProcess.spawn(
        'git',
        args,
        opts
      );
      let output = '';
      let errput = '';
      if (proc.stdout) {
        proc.stdout.on('data', chunk => output += chunk)
      }
      if (proc.stderr) {
        proc.stderr.on('data', chunk => errput += chunk)
      }
      proc.on('close', code => {
        if (code !== 0) {
          reject(new Error(
            `Failed at task "${text}": ${errput}`
          ));
        } else {
          let trimmedOutput = output.trim();
          if (!quiet) log(trimmedOutput);
          resolve(trimmedOutput);
        }
      });
    } catch(e) {
      reject(new Error(
        `Failed at task "${text}": ${e.message}`
      ));
    }
  });
}
