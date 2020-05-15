"use strict";
var gCommands = [
    // 'override',
    'update',
    'check',
    'set-version',
    'compile'
  ],
  runHelper = require('../');

module.exports = function(grunt) {

  grunt.registerMultiTask('mozutheme', function() {
    var done = this.async();
    var opts = this.data && this.data.opts || {};
    var target = (this.data && this.data.command) || this.target || this.args[0];
    if (gCommands.indexOf(target) === -1) {
      grunt.fail.warn('Unrecognized mozutheme command `' + target + '`.');
      return false;
    }
    grunt.verbose.ok('Recognized command ' + target);
    if (typeof opts === "function") {
      opts(grunt, run);
    } else {
      run(null, opts);
    }
    function run(err, opts) {
      if (err) {
        grunt.fail.warn(err);
        return false;
      }
      if (grunt.option('verbose')) {
        opts.verbose = true;
      }
      let helper = runHelper(target, opts);
      helper.on('info', x => grunt.log.oklns(x));
      helper.on('warn', x => grunt.log.writelns(x));
      helper.on('error', x => grunt.fail.warn(x));
      helper.on('done', done);
    }
  });

};
