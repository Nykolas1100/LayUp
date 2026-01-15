import { Primitives as P, CharUtil as CU } from './parsecco/src';
import { AST } from './layupAST';

const [expr, exprImpl] = P.recParser<AST.Expr>();

// Parse separators
const ws = P.ws;
const ws1 = P.ws1;
const semicolon = P.char(';');

// Parse 'let' keyword
const letKw = P.appfun(P.seq(P.str("let"))(ws1))(([_, __]) => null);

// Parse variable name
const identifier = P.appfun(P.seq(P.many1(P.letter))(ws))(([letters, _ws]) => letters.join(''));

// Parse '='
const assign = P.appfun(P.seq(P.char('='))(ws))(([_eq, _ws]) => null);

// Parse atoms
const number = P.appfun(P.seq(P.integer)(ws))(([n, _ws]) => new AST.Num(n));
const variable = P.appfun(P.seq(P.many1(P.letter))(ws))(([letters, _ws]) => new AST.Var(letters.join('')));

// Parse operations
const opChar = P.choice(P.char('+'))(
  P.choice(P.char('-'))(
    P.choice(P.char('*'))(
      P.char('/')
    )
  )
);
const operator = P.appfun(P.seq(opChar)(ws))(([op, _ws]) => op);

// Flatten the middle: ws + expr => expr
const middle = P.appfun(P.seq(ws)(expr))(([_ws, e]) => e);

// Flatten the closing: ws + ')' => ignore
const close = P.appfun(P.seq(ws)(P.char(')')))(([_ws, _]) => null);

// Parse parens
const paren = P.between(
  P.char('(')
)(close)(
  middle
);

// Atoms: number, variable, or parentheses
const atom = P.choice(number)(P.choice(variable)(paren));

// Parse expr
exprImpl.contents = P.appfun<[AST.Expr, [string, AST.Expr][]], AST.Expr>(
    P.seq(atom)(P.many(P.seq(operator)(atom)))
    )(([head, rest]) => rest.reduce( (acc, [op, right]) => AST.combining(acc, op, right), head
    )
);

// Parse let binding
const letBinding: P.IParser<AST.Expr> = P.appfun(
  P.seq(letKw)(P.seq(identifier)(P.seq(assign)(expr)))
)(([_, [name, [__, value]]]) => new AST.Let(name, value));

// Parse multiple formulas
export const grammar = P.many1(
  P.appfun(
    P.seq(letBinding)(P.seq(semicolon)(P.many(P.nl)))
  )(([formula, _]) => formula)
);

// Example
const stream = new CU.CharStream("let x = 1 + 4; let y = x * 3;");
const result = grammar(stream);
const parsed = result.next();

if (parsed.done && parsed.value.tag === "success") {
  const env: Record<string, AST.Expr> = {};
  const astList = parsed.value.result as AST.Expr[];

  for (const line of astList) {
    line.evaluate(env);
  }

  console.log(env); // { x: Num { value: 5 }, y: Num { value: 15 } }
}