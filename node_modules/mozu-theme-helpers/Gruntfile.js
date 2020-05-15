"use strict";

module.exports = function(grunt) {
  grunt.initConfig({
    babel: {
      options: {
          modules: 'common',
          optional: ['runtime']
      },
      dist: {
        files: [
          {
            expand: true,     // Enable dynamic expansion.
            cwd: './',      // Src matches are relative to this path.
            src: ['**/*.es6', '!node_modules/**'], // Actual pattern(s) to match.
            dest: './',   // Destination path prefix.
            ext: '.js',   // Dest filepaths will have this extension.
            extDot: 'first'   // Extensions in filenames begin after the first dot
          }
        ]
      }
    },
    watch: {
      babel: {
        files: ['**/*.es6', '!./node_modules/**'],
        tasks: ['babel']
      }
    }
  });
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['babel']);
};