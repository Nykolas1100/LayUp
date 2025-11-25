"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("./parsecco/src");
var layupAST_1 = require("./layupAST");
function flattenLetResult(result) {
    // result = [[[[bindResult, nameResult], assignResult], value]]
    var varName = result[0][0][1]; // access nameResult
    var val = result[1];
    return new layupAST_1.AST.Let(varName, new layupAST_1.AST.Num(val));
}
// Parse 'let'
var bind = src_1.Primitives.seq(src_1.Primitives.str("let"))(src_1.Primitives.ws1);
// Parse variable name
var name = src_1.Primitives.appfun(src_1.Primitives.seq(src_1.Primitives.many1(src_1.Primitives.letter))(src_1.Primitives.ws1))(function (_a) {
    var letters = _a[0], _ws = _a[1];
    return letters.join('');
});
var assign = src_1.Primitives.appfun(src_1.Primitives.seq(src_1.Primitives.char('='))(src_1.Primitives.ws1))(function (_a) {
    var eq = _a[0], _ws = _a[1];
    return eq;
});
var value = src_1.Primitives.integer;
var delimeter = src_1.Primitives.char(';');
var formula = src_1.Primitives.seq(src_1.Primitives.seq(src_1.Primitives.seq(bind)(name))(assign))(value);
var formulaNode = src_1.Primitives.appfun(formula)(flattenLetResult);
var grammar = src_1.Primitives.appfun(src_1.Primitives.seq(formulaNode)(delimeter))(function (_a) {
    var formula = _a[0], _ws = _a[1];
    return formula;
});
// const grammar = P.many1(P.appfun(P.seq(formulaNode)(delimeter))(([formula, _ws]) => formula));
var stream = new src_1.CharUtil.CharStream("let num = 10;");
var result = grammar(stream);
var parsed = result.next();
if (parsed.done) {
    if (parsed.value.tag == "success") {
        var env = {};
        var ast = parsed.value.result;
        console.dir(ast, { depth: null });
        // Run evaluation with environment
        var output = ast.evaluate(env);
        console.log("Result:", output.toString());
        console.dir(env, { depth: null });
    }
}

window.parseCode = function(codeString) {
    const stream = new src_1.CharUtil.CharStream(codeString);
    const result = grammar(stream);
    const parsed = result.next();

    if (parsed.done && parsed.value.tag === "success") {
        const env = {};
        const ast = parsed.value.result;
        const output = ast.evaluate(env);
        return { ast, output, env };
    } else {
        return { error: "Parsing failed", details: parsed.value };
    }
};
// TO-DO make a web form with input box that calls parser
// sep/sepby combinator expr, delimeter, ws, nl, ws, expr
// https://people.cs.nott.ac.uk/pszgmh/monparsing.pdf
