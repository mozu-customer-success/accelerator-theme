'use strict';

var path = require('path'),
    fs = require('fs');

    var namesToFilenames = {
      'theme': 'theme.json',
      'package': 'package.json',
      'bower': 'bower.json'
    };

var metadata =  {
  read: function(themePath, name) {
    var filePath = path.resolve(themePath, namesToFilenames[name]);
    try {
      return require(filePath);
    } catch(e) {
      throw new Error("Could not read " + filePath + ": " + e.message);
    }
  },
  write: function(themePath, name, contents) {
    return fs.writeFileSync(path.resolve(themePath, namesToFilenames[name]), JSON.stringify(contents, null, 2));
  },
  modify: function(themePath, name, transform) {
    return metadata.write(themePath, name, transform(metadata.read(themePath, name)));
  }
};

export default metadata;