'use strict';
import path from "path";
import compiler from "../utils/compiler";
import chalk from "chalk";
import slug from "../utils/slug";
import getThemeDir from "../utils/get-theme-dir";
import metadata from "../utils/metadata";

let compile = function(task, opts) {

  opts.ignore = opts.ignore || [];

  let themeDir = getThemeDir(opts.dir);

  if (!themeDir) {
    return task.fail("Not inside a theme directory. Please supply a theme directory to compile.");
  }

  let base = metadata.read(themeDir, 'theme').about.extends;

  if (base) opts.manualancestry = [path.resolve(themeDir, 'references', slug(base))];

  opts.ignore.push('/references','\\.git','node_modules','^/resources','^/tasks','\\.zip$');

  if (opts.verbose) opts.logLevel = 6;

  let job = compiler(themeDir, opts, err => {
    if (err) {
      task.fail(err);
    } else {
      task.info("Theme compilation complete.");
      task.done();
    }
  });

  job.on('log', function(str, sev) {
    switch(sev) {
      case "error":
        job.cleanup(() => task.fail(`Compiler failed: ${str}`));
        break;
      case "warning":
        job.cleanup(() => task.fail(`Compiler warning: ${str}`));
        break;
      default:
        task.info(`Compiler output: ${str}`);
    }
  });

  return task;
};

compile.transformArguments = function({ options, _args }) {
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
}

export default compile;
