System.config({
  "paths": {
    "*": "*.js",
    "~/*": "lib/*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "jsx": "github:floatdrop/plugin-jsx@0.0.2",
    "react": "npm:react@0.12.1",
    "react-tools": "npm:react-tools@0.12.1",
    "github:jspm/nodelibs@0.0.7": {
      "Base64": "npm:Base64@0.2.1",
      "base64-js": "npm:base64-js@0.0.7",
      "ieee754": "npm:ieee754@1.1.4",
      "inherits": "npm:inherits@2.0.1",
      "json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:commoner@0.10.1": {
      "commander": "npm:commander@2.5.0",
      "glob": "npm:glob@4.2.2",
      "graceful-fs": "npm:graceful-fs@3.0.5",
      "iconv-lite": "npm:iconv-lite@0.4.5",
      "install": "npm:install@0.1.8",
      "mkdirp": "npm:mkdirp@0.5.0",
      "private": "npm:private@0.1.6",
      "q": "npm:q@1.1.2",
      "recast": "npm:recast@0.9.11"
    },
    "npm:envify@3.2.0": {
      "jstransform": "npm:jstransform@7.0.0",
      "through": "npm:through@2.3.6"
    },
    "npm:glob@4.2.2": {
      "inflight": "npm:inflight@1.0.4",
      "inherits": "npm:inherits@2.0.1",
      "minimatch": "npm:minimatch@1.0.0",
      "once": "npm:once@1.3.1"
    },
    "npm:inflight@1.0.4": {
      "once": "npm:once@1.3.1",
      "wrappy": "npm:wrappy@1.0.1"
    },
    "npm:jstransform@7.0.0": {
      "base62": "npm:base62@0.1.1",
      "esprima-fb": "npm:esprima-fb@7001.1.0-dev-harmony-fb",
      "source-map": "npm:source-map@0.1.31"
    },
    "npm:jstransform@8.2.0": {
      "base62": "npm:base62@0.1.1",
      "esprima-fb": "npm:esprima-fb@8001.1001.0-dev-harmony-fb",
      "source-map": "npm:source-map@0.1.31"
    },
    "npm:minimatch@1.0.0": {
      "lru-cache": "npm:lru-cache@2.5.0",
      "sigmund": "npm:sigmund@1.0.0"
    },
    "npm:mkdirp@0.5.0": {
      "minimist": "npm:minimist@0.0.8"
    },
    "npm:once@1.3.1": {
      "wrappy": "npm:wrappy@1.0.1"
    },
    "npm:react-tools@0.12.1": {
      "commoner": "npm:commoner@0.10.1",
      "jstransform": "npm:jstransform@8.2.0"
    },
    "npm:react@0.12.1": {
      "envify": "npm:envify@3.2.0"
    },
    "npm:recast@0.9.11": {
      "ast-types": "npm:ast-types@0.6.6",
      "esprima-fb": "npm:esprima-fb@8001.1001.0-dev-harmony-fb",
      "private": "npm:private@0.1.6",
      "source-map": "npm:source-map@0.1.40"
    },
    "npm:source-map@0.1.31": {
      "amdefine": "npm:amdefine@0.0.8"
    },
    "npm:source-map@0.1.40": {
      "amdefine": "npm:amdefine@0.0.8"
    }
  }
});

