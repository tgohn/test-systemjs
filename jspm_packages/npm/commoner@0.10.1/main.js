/* */ 
(function(process) {
  var path = require("github:jspm/nodelibs@0.0.7/path");
  var Commoner = require("./lib/commoner").Commoner;
  exports.Commoner = Commoner;
  function defCallback(name) {
    exports[name] = function() {
      var commoner = new Commoner;
      commoner[name].apply(commoner, arguments);
      commoner.cliBuildP();
      return commoner;
    };
  }
  defCallback("version");
  defCallback("resolve");
  defCallback("process");
})(require("github:jspm/nodelibs@0.0.7/process"));
