import { Primitives as P, CharUtil as CU } from './parsecco/src';
import { AST } from './layupAST';

function flattenLetResult(result: any): AST.Let {
    const varName: string = result[0][0][1];
    const valueExpr: AST.Expr = result[1];
    return new AST.Let(varName, valueExpr);
}

// Parse 'let'
const bind = P.seq(P.str("let"))(P.ws1);

// Parse variable name
const name = P.appfun(
  P.seq(P.many1(P.letter))(P.ws))
  (([letters, _ws]) => letters.join('')
);

const assign = P.appfun(P.seq(P.char('='))(P.ws))(([eq, _ws]) => eq);

const variable = P.appfun(P.seq(P.many1(P.letter))(P.ws))(([letters, _ws]): AST.Expr => new AST.Var(letters.join('')));
const num = P.appfun(P.seq(P.integer)(P.ws))(([n, _ws]): AST.Expr => new AST.Num(n));
const addition = P.char('+');
const subtraction = P.char('-');
const multiplication = P.char('*');
const division = P.char('/');

const op = P.appfun(
  P.seq(
    P.choice(addition)(
      P.choice(subtraction)(
        P.choice(multiplication)(division)
      )
    )
  )(P.ws)
)(
  ([operator, _ws]) => {
    const rawOp = Array.isArray(operator) ? operator.flat(Infinity)[0] : operator;
    return rawOp;
  }
);

const atom = P.choice(num)(variable);

export const expr = P.appfun(
  P.seq(atom)(P.many(P.seq(op)(atom)))
)(
  ([head, rest]: [AST.Expr, [string, AST.Expr][]]) => 
    rest.reduce(
      (acc, [operator, right]) => AST.combining(acc, operator, right),
      head
    )
);

const value = expr;

const delimeter = P.char(';');

const formula = P.seq(P.seq(P.seq(bind)(name))(assign))(value);

const formulaNode = P.appfun(formula)(flattenLetResult);

export const grammar = P.many1(P.appfun(P.seq(formulaNode)(P.seq(delimeter)(P.many(P.nl))))(([formula, _ws]) => formula));

const stream = new CU.CharStream("");
const result = grammar(stream);
const parsed = result.next();

if (parsed.done && parsed.value.tag === "success") {
    const env: Record<string, AST.Expr> = {};
    const astList = parsed.value.result as AST.Expr[];

    for (const line of astList) {
        line.evaluate(env);
    }

    console.log(env);
}

// sep/sepby combinator expr, delimeter, ws, nl, ws, expr
// https://people.cs.nott.ac.uk/pszgmh/monparsing.pdf