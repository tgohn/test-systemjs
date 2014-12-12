/* */ 
var assert = require("github:jspm/nodelibs@0.0.7/assert");
var types = require("./types");
var n = types.namedTypes;
var b = types.builders;
var isNumber = types.builtInTypes.number;
var isArray = types.builtInTypes.array;
var Path = require("./path");
var Scope = require("./scope");
function NodePath(value, parentPath, name) {
  assert.ok(this instanceof NodePath);
  Path.call(this, value, parentPath, name);
}
require("github:jspm/nodelibs@0.0.7/util").inherits(NodePath, Path);
var NPp = NodePath.prototype;
Object.defineProperties(NPp, {
  node: {get: function() {
      Object.defineProperty(this, "node", {
        configurable: true,
        value: this._computeNode()
      });
      return this.node;
    }},
  parent: {get: function() {
      Object.defineProperty(this, "parent", {
        configurable: true,
        value: this._computeParent()
      });
      return this.parent;
    }},
  scope: {get: function() {
      Object.defineProperty(this, "scope", {
        configurable: true,
        value: this._computeScope()
      });
      return this.scope;
    }}
});
NPp.replace = function() {
  delete this.node;
  delete this.parent;
  delete this.scope;
  return Path.prototype.replace.apply(this, arguments);
};
NPp.prune = function() {
  var remainingNodePath = this.parent;
  this.replace();
  return cleanUpNodesAfterPrune(remainingNodePath);
};
NPp._computeNode = function() {
  var value = this.value;
  if (n.Node.check(value)) {
    return value;
  }
  var pp = this.parentPath;
  return pp && pp.node || null;
};
NPp._computeParent = function() {
  var value = this.value;
  var pp = this.parentPath;
  if (!n.Node.check(value)) {
    while (pp && !n.Node.check(pp.value)) {
      pp = pp.parentPath;
    }
    if (pp) {
      pp = pp.parentPath;
    }
  }
  while (pp && !n.Node.check(pp.value)) {
    pp = pp.parentPath;
  }
  return pp || null;
};
NPp._computeScope = function() {
  var value = this.value;
  var pp = this.parentPath;
  var scope = pp && pp.scope;
  if (n.Node.check(value) && Scope.isEstablishedBy(value)) {
    scope = new Scope(this, scope);
  }
  return scope || null;
};
NPp.getValueProperty = function(name) {
  return types.getFieldValue(this.value, name);
};
NPp.needsParens = function(assumeExpressionContext) {
  var pp = this.parentPath;
  if (!pp) {
    return false;
  }
  var node = this.value;
  if (!n.Expression.check(node)) {
    return false;
  }
  if (node.type === "Identifier") {
    return false;
  }
  while (!n.Node.check(pp.value)) {
    pp = pp.parentPath;
    if (!pp) {
      return false;
    }
  }
  var parent = pp.value;
  switch (node.type) {
    case "UnaryExpression":
    case "SpreadElement":
    case "SpreadProperty":
      return parent.type === "MemberExpression" && this.name === "object" && parent.object === node;
    case "BinaryExpression":
    case "LogicalExpression":
      switch (parent.type) {
        case "CallExpression":
          return this.name === "callee" && parent.callee === node;
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
          return true;
        case "MemberExpression":
          return this.name === "object" && parent.object === node;
        case "BinaryExpression":
        case "LogicalExpression":
          var po = parent.operator;
          var pp = PRECEDENCE[po];
          var no = node.operator;
          var np = PRECEDENCE[no];
          if (pp > np) {
            return true;
          }
          if (pp === np && this.name === "right") {
            assert.strictEqual(parent.right, node);
            return true;
          }
        default:
          return false;
      }
    case "SequenceExpression":
      switch (parent.type) {
        case "ForStatement":
          return false;
        case "ExpressionStatement":
          return this.name !== "expression";
        default:
          return true;
      }
    case "YieldExpression":
      switch (parent.type) {
        case "BinaryExpression":
        case "LogicalExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "CallExpression":
        case "MemberExpression":
        case "NewExpression":
        case "ConditionalExpression":
        case "YieldExpression":
          return true;
        default:
          return false;
      }
    case "Literal":
      return parent.type === "MemberExpression" && isNumber.check(node.value) && this.name === "object" && parent.object === node;
    case "AssignmentExpression":
    case "ConditionalExpression":
      switch (parent.type) {
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "BinaryExpression":
        case "LogicalExpression":
          return true;
        case "CallExpression":
          return this.name === "callee" && parent.callee === node;
        case "ConditionalExpression":
          return this.name === "test" && parent.test === node;
        case "MemberExpression":
          return this.name === "object" && parent.object === node;
        default:
          return false;
      }
    default:
      if (parent.type === "NewExpression" && this.name === "callee" && parent.callee === node) {
        return containsCallExpression(node);
      }
  }
  if (assumeExpressionContext !== true && !this.canBeFirstInStatement() && this.firstInStatement())
    return true;
  return false;
};
function isBinary(node) {
  return n.BinaryExpression.check(node) || n.LogicalExpression.check(node);
}
function isUnaryLike(node) {
  return n.UnaryExpression.check(node) || (n.SpreadElement && n.SpreadElement.check(node)) || (n.SpreadProperty && n.SpreadProperty.check(node));
}
var PRECEDENCE = {};
[["||"], ["&&"], ["|"], ["^"], ["&"], ["==", "===", "!=", "!=="], ["<", ">", "<=", ">=", "in", "instanceof"], [">>", "<<", ">>>"], ["+", "-"], ["*", "/", "%"]].forEach(function(tier, i) {
  tier.forEach(function(op) {
    PRECEDENCE[op] = i;
  });
});
function containsCallExpression(node) {
  if (n.CallExpression.check(node)) {
    return true;
  }
  if (isArray.check(node)) {
    return node.some(containsCallExpression);
  }
  if (n.Node.check(node)) {
    return types.someField(node, function(name, child) {
      return containsCallExpression(child);
    });
  }
  return false;
}
NPp.canBeFirstInStatement = function() {
  var node = this.node;
  return !n.FunctionExpression.check(node) && !n.ObjectExpression.check(node);
};
NPp.firstInStatement = function() {
  return firstInStatement(this);
};
function firstInStatement(path) {
  for (var node,
      parent; path.parent; path = path.parent) {
    node = path.node;
    parent = path.parent.node;
    if (n.BlockStatement.check(parent) && path.parent.name === "body" && path.name === 0) {
      assert.strictEqual(parent.body[0], node);
      return true;
    }
    if (n.ExpressionStatement.check(parent) && path.name === "expression") {
      assert.strictEqual(parent.expression, node);
      return true;
    }
    if (n.SequenceExpression.check(parent) && path.parent.name === "expressions" && path.name === 0) {
      assert.strictEqual(parent.expressions[0], node);
      continue;
    }
    if (n.CallExpression.check(parent) && path.name === "callee") {
      assert.strictEqual(parent.callee, node);
      continue;
    }
    if (n.MemberExpression.check(parent) && path.name === "object") {
      assert.strictEqual(parent.object, node);
      continue;
    }
    if (n.ConditionalExpression.check(parent) && path.name === "test") {
      assert.strictEqual(parent.test, node);
      continue;
    }
    if (isBinary(parent) && path.name === "left") {
      assert.strictEqual(parent.left, node);
      continue;
    }
    if (n.UnaryExpression.check(parent) && !parent.prefix && path.name === "argument") {
      assert.strictEqual(parent.argument, node);
      continue;
    }
    return false;
  }
  return true;
}
function cleanUpNodesAfterPrune(remainingNodePath) {
  if (n.VariableDeclaration.check(remainingNodePath.node)) {
    var declarations = remainingNodePath.get('declarations').value;
    if (!declarations || declarations.length === 0) {
      return remainingNodePath.prune();
    }
  } else if (n.ExpressionStatement.check(remainingNodePath.node)) {
    if (!remainingNodePath.get('expression').value) {
      return remainingNodePath.prune();
    }
  } else if (n.IfStatement.check(remainingNodePath.node)) {
    cleanUpIfStatementAfterPrune(remainingNodePath);
  }
  return remainingNodePath;
}
function cleanUpIfStatementAfterPrune(ifStatement) {
  var testExpression = ifStatement.get('test').value;
  var alternate = ifStatement.get('alternate').value;
  var consequent = ifStatement.get('consequent').value;
  if (!consequent && !alternate) {
    var testExpressionStatement = b.expressionStatement(testExpression);
    ifStatement.replace(testExpressionStatement);
  } else if (!consequent && alternate) {
    var negatedTestExpression = b.unaryExpression('!', testExpression, true);
    if (n.UnaryExpression.check(testExpression) && testExpression.operator === '!') {
      negatedTestExpression = testExpression.argument;
    }
    ifStatement.get("test").replace(negatedTestExpression);
    ifStatement.get("consequent").replace(alternate);
    ifStatement.get("alternate").replace();
  }
}
module.exports = NodePath;
