/* */ 
var mkdirp = require("../index");
var path = require("github:jspm/nodelibs@0.0.7/path");
var fs = require("github:jspm/nodelibs@0.0.7/fs");
var test = require("tap").test;
test('root', function(t) {
  var file = path.resolve('/');
  mkdirp(file, 0755, function(err) {
    if (err)
      throw err;
    fs.stat(file, function(er, stat) {
      if (er)
        throw er;
      t.ok(stat.isDirectory(), 'target is a directory');
      t.end();
    });
  });
});
