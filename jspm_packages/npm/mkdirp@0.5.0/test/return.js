/* */ 
var mkdirp = require("../index");
var path = require("github:jspm/nodelibs@0.0.7/path");
var fs = require("github:jspm/nodelibs@0.0.7/fs");
var test = require("tap").test;
test('return value', function(t) {
  t.plan(4);
  var x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
  var y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
  var z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
  var file = '/tmp/' + [x, y, z].join('/');
  mkdirp(file, function(err, made) {
    t.ifError(err);
    t.equal(made, '/tmp/' + x);
    mkdirp(file, function(err, made) {
      t.ifError(err);
      t.equal(made, null);
    });
  });
});
