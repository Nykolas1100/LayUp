import { Primitives as P, CharUtil as CU } from './parsecco/src';
import { AST } from './layupAST';

function flattenLetResult(result: any): AST.Let {
    // result = [[[[bindResult, nameResult], assignResult], value]]
    const varName: string = result[0][0][1]; // access nameResult
    const val: number = result[1];
    return new AST.Let(varName, new AST.Num(val));
}
// Parse 'let'
const bind = P.seq(P.str("let"))(P.ws1);


// Parse variable name
const name = P.appfun(
  P.seq(P.many1(P.letter))(P.ws1))
  (([letters, _ws]) => letters.join('')
);

const assign = P.appfun(P.seq(P.char('='))(P.ws1))(([eq, _ws]) => eq);

const value = P.integer;

const delimeter = P.char(';');

const formula = P.seq(P.seq(P.seq(bind)(name))(assign))(value);

const formulaNode = P.appfun(formula)(flattenLetResult);

const grammar = P.appfun(P.seq(formulaNode)(delimeter))(([formula, _ws]) => formula);

// const grammar = P.many1(P.appfun(P.seq(formulaNode)(delimeter))(([formula, _ws]) => formula));

const stream = new CU.CharStream("let num = 10;");
const result = grammar(stream);
const parsed = result.next();

if (parsed.done) {
    if (parsed.value.tag == "success") {
        const env: Record<string, AST.Expr> = {};
        const ast = parsed.value.result as AST.Expr;
        console.dir(ast, { depth: null });

        // Run evaluation with environment
        const output = ast.evaluate(env);

        console.log("Result:", output.toString());
        console.dir(env, { depth: null });
    }
}

// TO-DO make a web form with input box that calls parser
// sep/sepby combinator expr, delimeter, ws, nl, ws, expr
// https://people.cs.nott.ac.uk/pszgmh/monparsing.pdf