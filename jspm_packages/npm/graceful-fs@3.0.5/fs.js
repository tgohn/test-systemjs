/* */ 
(function(process) {
  var mod = require("module");
  var pre = '(function (exports, require, module, __filename, __dirname) { ';
  var post = '});';
  var src = pre + process.binding('natives').fs + post;
  var vm = require("github:jspm/nodelibs@0.0.7/vm");
  var fn = vm.runInThisContext(src);
  fn(exports, require, module, __filename, __dirname);
})(require("github:jspm/nodelibs@0.0.7/process"));
