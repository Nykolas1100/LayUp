"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("./parsecco/src");
var calcAST_1 = require("./calcAST");
var addition = src_1.Primitives.char('+');
var subtraction = src_1.Primitives.char('-');
var equation = src_1.Primitives.appfun(src_1.Primitives.seq(src_1.Primitives.integer)(src_1.Primitives.many(src_1.Primitives.choice(src_1.Primitives.seq(addition)(src_1.Primitives.integer))(src_1.Primitives.seq(subtraction)(src_1.Primitives.integer)))))(function (_a) {
    var first = _a[0], rest = _a[1];
    var expr = new calcAST_1.AST.Num(first);
    for (var _i = 0, rest_1 = rest; _i < rest_1.length; _i++) {
        var _b = rest_1[_i], opToken = _b[0], val = _b[1];
        var op = opToken.toString();
        expr = calcAST_1.AST.combining(expr, op, new calcAST_1.AST.Num(val));
    }
    return expr;
});
// const equation = P.seq(P.integer)(P.many(P.choice(P.seq(addition)(P.integer)) (P.seq(subtraction) (P.integer))));
var grammar = src_1.Primitives.left(equation)(src_1.Primitives.eof);
var stream = new src_1.CharUtil.CharStream("3-2+1");
var result = grammar(stream);
var parsed = result.next();
if (parsed.done) {
    var ast = parsed.value.result; // This is your full Expr AST
    console.dir(ast, { depth: null }); // Optional: inspect the tree
    // Run evaluation here
    var output = ast.evaluate(); // <-- CALL evaluate()
    console.log("Result:", output.toString());
}
