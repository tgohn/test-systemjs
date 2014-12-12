/* */ 
var mkdirp = require("../index");
var path = require("github:jspm/nodelibs@0.0.7/path");
var fs = require("github:jspm/nodelibs@0.0.7/fs");
var test = require("tap").test;
test('return value', function(t) {
  t.plan(2);
  var x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
  var y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
  var z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);
  var file = '/tmp/' + [x, y, z].join('/');
  var made = mkdirp.sync(file);
  t.equal(made, '/tmp/' + x);
  made = mkdirp.sync(file);
  t.equal(made, null);
});
