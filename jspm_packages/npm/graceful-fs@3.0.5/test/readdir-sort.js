/* */ 
(function(process) {
  var test = require("tap").test;
  var fs = require("../fs");
  var readdir = fs.readdir;
  fs.readdir = function(path, cb) {
    process.nextTick(function() {
      cb(null, ["b", "z", "a"]);
    });
  };
  var g = require("../graceful-fs");
  test("readdir reorder", function(t) {
    g.readdir("whatevers", function(er, files) {
      if (er)
        throw er;
      t.same(files, ["a", "b", "z"]);
      t.end();
    });
  });
})(require("github:jspm/nodelibs@0.0.7/process"));