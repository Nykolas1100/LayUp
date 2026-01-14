import { Primitives as P, CharUtil as CU } from './parsecco/src';
import { AST } from './layupAST';
function flattenLetResult(result) {
    const varName = result[0][0][1];
    const valueExpr = result[1];
    return new AST.Let(varName, valueExpr);
}
// Parse 'let'
const bind = P.seq(P.str("let"))(P.ws1);
// Parse variable name
const name = P.appfun(P.seq(P.many1(P.letter))(P.ws1))(([letters, _ws]) => letters.join(''));
const assign = P.appfun(P.seq(P.char('='))(P.ws1))(([eq, _ws]) => eq);
const num = P.appfun(P.integer)((n) => new AST.Num(n));
const addition = P.char('+');
const subtraction = P.char('-');
const multiplication = P.char('*');
const division = P.char('/');
const op = P.appfun(P.seq(P.choice(addition)(P.choice(subtraction)(P.choice(multiplication)(division))))(P.ws))(([op, _ws]) => op);
export const expr = P.appfun(P.seq(num)(P.many(P.seq(op)(num))))(([head, rest]) => rest.reduce((acc, [operator, right]) => AST.combining(acc, operator, right), head));
const value = expr;
const delimeter = P.char(';');
const formula = P.seq(P.seq(P.seq(bind)(name))(assign))(value);
const formulaNode = P.appfun(formula)(flattenLetResult);
export const grammar = P.many1(P.appfun(P.seq(formulaNode)(P.seq(delimeter)(P.many(P.nl))))(([formula, _ws]) => formula));
const stream = new CU.CharStream("let num = 10;let double = 20;");
const result = grammar(stream);
const parsed = result.next();
if (parsed.done && parsed.value.tag === "success") {
    const env = {};
    const astList = parsed.value.result;
    for (const line of astList) {
        line.evaluate(env);
    }
    console.log(env);
}
// sep/sepby combinator expr, delimeter, ws, nl, ws, expr
// https://people.cs.nott.ac.uk/pszgmh/monparsing.pdf
