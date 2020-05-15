# mozu-theme-helpers

Library for common theme tasks: checking and maintaining repository relationship, and compiling JavaScript.

## Requires
 - nodejs 0.12 or above

## Install
```
npm install --save-dev mozu-theme-helpers
```

## API
```js
const mozuThemeHelpers = require('mozu-theme-helpers');
const pathToTheme = "/Users/you/mozuThemes/someTheme";
let task = mozuThemeHelpers('check', { dir: pathToTheme });
// tasks are EventEmitters, emitting "info", "warn", "error", and "done" events
task.on('info', console.log);
task.on('warn', console.log);
task.on('error' e => {
  console.error(e);
  process.exit(1);
});
task.on('done', summary => {
  console.log(summary);
  process.exit(0);
});
```

## Task Types

### `check`

Maintains base theme relationship in your `theme.json` and in Git, and informs you of available updates. This task is meant to be run on every incremental build of your theme.

 - Detects the base theme of the current theme, by looking in Git and in `theme.json`
 - Reattaches a `basetheme` remote if necessary.
 - Checks the base theme for updates.
 - Displays new available versions, or all new available commits, based on the `baseThemeChannel` setting in `theme.json`. If it's set to `stable`, displays only available stable versions. If it's set to `prerelease`, will also display prerelease versions. If it's set to `edge`, will display all commits that are available to merge.
 - Updates the `baseThemeVersion` in `theme.json` if it detects that you have merged in later versions.

Options:
 - `dir` - The directory of the theme to check. Defaults to `process.cwd()`.

### `compile`

Compiles your theme JavaScript using the customized Mozu RequireJS Compiler.

 - Puts built JS in the `compiled` directory.
 - Minifies JS using Uglify2 by default.
 - Detects `extends` in theme.json and uses a temp directory to simulate runtime resolution. **This feature is deprecated; you should have `"extends": null` in your `theme.json`.**

Options:
 - `skipminification` - Skip the minification step. Use this during development for faster builds. Default `false`.
 - `verbose` - Say a lot more stuff.

## Grunt Task

This library is mostly designed for use in Grunt, and so it has a grunt task.
Grunt will recognize the `/tasks/` folder of any node module, so you can say:
```js
grunt.loadNpmTasks('mozu-theme-helpers');
```
This will give Grunt a `mozutheme` task, that can run `check` and `compile` with options.

Example task configuration:
```js
mozutheme: {
  check: {
    command: 'check'
  },
  fullcompile: {
    command: 'compile'
  },
  quickcompile: {
    command: 'compile',
    opts: {
      skipminification: true
    }
  }
}
```

Task configuration must include a `command` property that can be either `'check'` or `'compile'`. It can optionally include an `opts` object that will be sent to the task as options.

`opts` can also be a function, that can asynchronously create options. It will receive the `grunt` process object and a `callback` as arguments, and should call `callback` with an error as the first argument if an error occurred, or `null` as the first argument and an options object to be sent to the task as the second argument.

### License
MIT. Copyright 2016 Volusion, LLC.
