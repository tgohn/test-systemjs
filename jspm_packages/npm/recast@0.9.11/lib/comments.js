/* */ 
var assert = require("github:jspm/nodelibs@0.0.7/assert");
var types = require("./types");
var n = types.namedTypes;
var isArray = types.builtInTypes.array;
var isObject = types.builtInTypes.object;
var linesModule = require("./lines");
var fromString = linesModule.fromString;
var Lines = linesModule.Lines;
var concat = linesModule.concat;
var comparePos = require("./util").comparePos;
var childNodesCacheKey = require("private").makeUniqueKey();
function getSortedChildNodes(node, resultArray) {
  if (!node) {
    return;
  }
  if (resultArray) {
    if (n.Node.check(node) && n.SourceLocation.check(node.loc)) {
      for (var i = resultArray.length - 1; i >= 0; --i) {
        if (comparePos(resultArray[i].loc.end, node.loc.start) <= 0) {
          break;
        }
      }
      resultArray.splice(i + 1, 0, node);
      return;
    }
  } else if (node[childNodesCacheKey]) {
    return node[childNodesCacheKey];
  }
  var names;
  if (isArray.check(node)) {
    names = Object.keys(node);
  } else if (isObject.check(node)) {
    names = types.getFieldNames(node);
  } else {
    return;
  }
  if (!resultArray) {
    Object.defineProperty(node, childNodesCacheKey, {
      value: resultArray = [],
      enumerable: false
    });
  }
  for (var i = 0,
      nameCount = names.length; i < nameCount; ++i) {
    getSortedChildNodes(node[names[i]], resultArray);
  }
  return resultArray;
}
function decorateComment(node, comment) {
  var childNodes = getSortedChildNodes(node);
  var left = 0,
      right = childNodes.length;
  while (left < right) {
    var middle = (left + right) >> 1;
    var child = childNodes[middle];
    if (comparePos(child.loc.start, comment.loc.start) <= 0 && comparePos(comment.loc.end, child.loc.end) <= 0) {
      decorateComment(comment.enclosingNode = child, comment);
      return;
    }
    if (comparePos(child.loc.end, comment.loc.start) <= 0) {
      var precedingNode = child;
      left = middle + 1;
      continue;
    }
    if (comparePos(comment.loc.end, child.loc.start) <= 0) {
      var followingNode = child;
      right = middle;
      continue;
    }
    throw new Error("Comment location overlaps with node location");
  }
  if (precedingNode) {
    comment.precedingNode = precedingNode;
  }
  if (followingNode) {
    comment.followingNode = followingNode;
  }
}
exports.attach = function(comments, ast, lines) {
  if (!isArray.check(comments)) {
    return;
  }
  var tiesToBreak = [];
  comments.forEach(function(comment) {
    comment.loc.lines = lines;
    decorateComment(ast, comment);
    var pn = comment.precedingNode;
    var en = comment.enclosingNode;
    var fn = comment.followingNode;
    if (pn && fn) {
      var tieCount = tiesToBreak.length;
      if (tieCount > 0) {
        var lastTie = tiesToBreak[tieCount - 1];
        assert.strictEqual(lastTie.precedingNode === comment.precedingNode, lastTie.followingNode === comment.followingNode);
        if (lastTie.followingNode !== comment.followingNode) {
          breakTies(tiesToBreak, lines);
        }
      }
      tiesToBreak.push(comment);
    } else if (pn) {
      breakTies(tiesToBreak, lines);
      Comments.forNode(pn).addTrailing(comment);
    } else if (fn) {
      breakTies(tiesToBreak, lines);
      Comments.forNode(fn).addLeading(comment);
    } else if (en) {
      breakTies(tiesToBreak, lines);
      Comments.forNode(en).addDangling(comment);
    } else {
      throw new Error("AST contains no nodes at all?");
    }
  });
  breakTies(tiesToBreak, lines);
};
function breakTies(tiesToBreak, lines) {
  var tieCount = tiesToBreak.length;
  if (tieCount === 0) {
    return;
  }
  var pn = tiesToBreak[0].precedingNode;
  var fn = tiesToBreak[0].followingNode;
  var gapEndPos = fn.loc.start;
  for (var indexOfFirstLeadingComment = tieCount; indexOfFirstLeadingComment > 0; --indexOfFirstLeadingComment) {
    var comment = tiesToBreak[indexOfFirstLeadingComment - 1];
    assert.strictEqual(comment.precedingNode, pn);
    assert.strictEqual(comment.followingNode, fn);
    var gap = lines.sliceString(comment.loc.end, gapEndPos);
    if (/\S/.test(gap)) {
      break;
    }
    gapEndPos = comment.loc.start;
  }
  while (indexOfFirstLeadingComment <= tieCount && (comment = tiesToBreak[indexOfFirstLeadingComment]) && comment.type === "Line" && comment.loc.start.column > fn.loc.start.column) {
    ++indexOfFirstLeadingComment;
  }
  tiesToBreak.forEach(function(comment, i) {
    if (i < indexOfFirstLeadingComment) {
      Comments.forNode(pn).addTrailing(comment);
    } else {
      Comments.forNode(fn).addLeading(comment);
    }
  });
  tiesToBreak.length = 0;
}
function Comments() {
  assert.ok(this instanceof Comments);
  this.leading = [];
  this.dangling = [];
  this.trailing = [];
}
var Cp = Comments.prototype;
Comments.forNode = function forNode(node) {
  var comments = node.comments;
  if (!comments) {
    Object.defineProperty(node, "comments", {
      value: comments = new Comments,
      enumerable: false
    });
  }
  return comments;
};
Cp.forEach = function forEach(callback, context) {
  this.leading.forEach(callback, context);
  this.trailing.forEach(callback, context);
};
Cp.addLeading = function addLeading(comment) {
  this.leading.push(comment);
};
Cp.addDangling = function addDangling(comment) {
  this.dangling.push(comment);
};
Cp.addTrailing = function addTrailing(comment) {
  comment.trailing = true;
  if (comment.type === "Block") {
    this.trailing.push(comment);
  } else {
    this.leading.push(comment);
  }
};
function printLeadingComment(comment, options) {
  var loc = comment.loc;
  var lines = loc && loc.lines;
  var parts = [];
  if (comment.type === "Block") {
    parts.push("/*", fromString(comment.value, options), "*/");
  } else if (comment.type === "Line") {
    parts.push("//", fromString(comment.value, options));
  } else
    assert.fail(comment.type);
  if (comment.trailing) {
    parts.push("\n");
  } else if (lines instanceof Lines) {
    var trailingSpace = lines.slice(loc.end, lines.skipSpaces(loc.end));
    if (trailingSpace.length === 1) {
      parts.push(trailingSpace);
    } else {
      parts.push(new Array(trailingSpace.length).join("\n"));
    }
  } else {
    parts.push("\n");
  }
  return concat(parts).stripMargin(loc ? loc.start.column : 0);
}
function printTrailingComment(comment, options) {
  var loc = comment.loc;
  var lines = loc && loc.lines;
  var parts = [];
  if (lines instanceof Lines) {
    var fromPos = lines.skipSpaces(loc.start, true) || lines.firstPos();
    var leadingSpace = lines.slice(fromPos, loc.start);
    if (leadingSpace.length === 1) {
      parts.push(leadingSpace);
    } else {
      parts.push(new Array(leadingSpace.length).join("\n"));
    }
  }
  if (comment.type === "Block") {
    parts.push("/*", fromString(comment.value, options), "*/");
  } else if (comment.type === "Line") {
    parts.push("//", fromString(comment.value, options), "\n");
  } else
    assert.fail(comment.type);
  return concat(parts).stripMargin(loc ? loc.start.column : 0, true);
}
exports.printComments = function(comments, innerLines, options) {
  if (innerLines) {
    assert.ok(innerLines instanceof Lines);
  } else {
    innerLines = fromString("");
  }
  if (!comments || !(comments.leading.length + comments.trailing.length)) {
    return innerLines;
  }
  var parts = [];
  comments.leading.forEach(function(comment) {
    parts.push(printLeadingComment(comment, options));
  });
  parts.push(innerLines);
  comments.trailing.forEach(function(comment) {
    assert.strictEqual(comment.type, "Block");
    parts.push(printTrailingComment(comment, options));
  });
  return concat(parts);
};
