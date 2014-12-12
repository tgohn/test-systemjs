/* */ 
(function(process) {
  var mkdirp = require("../index");
  var path = require("github:jspm/nodelibs@0.0.7/path");
  var fs = require("github:jspm/nodelibs@0.0.7/fs");
  var exists = fs.exists || path.exists;
  var test = require("tap").test;
  test('umask sync modes', function(t) {
    t.plan(4);
    var x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
    var y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
    var z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
    var file = '/tmp/' + [x, y, z].join('/');
    try {
      mkdirp.sync(file);
    } catch (err) {
      t.fail(err);
      return t.end();
    }
    exists(file, function(ex) {
      t.ok(ex, 'file created');
      fs.stat(file, function(err, stat) {
        t.ifError(err);
        t.equal(stat.mode & 0777, (0777 & (~process.umask())));
        t.ok(stat.isDirectory(), 'target not a directory');
      });
    });
  });
})(require("github:jspm/nodelibs@0.0.7/process"));
