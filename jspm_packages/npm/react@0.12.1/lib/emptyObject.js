/* */ 
(function(process) {
  "use strict";
  var emptyObject = {};
  if ("production" !== process.env.NODE_ENV) {
    Object.freeze(emptyObject);
  }
  module.exports = emptyObject;
})(require("github:jspm/nodelibs@0.0.7/process"));
