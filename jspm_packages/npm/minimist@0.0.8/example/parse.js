/* */ 
(function(process) {
  var argv = require("../index")(process.argv.slice(2));
  console.dir(argv);
})(require("github:jspm/nodelibs@0.0.7/process"));
