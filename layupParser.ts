import { Primitives as P, CharUtil as CU } from './parsecco/src';
import { AST } from './layupAST';

const [expr, exprImpl] = P.recParser<AST.Expr>();

// Parse separators
const ws = P.ws;
const ws1 = P.ws1;
const semicolon = P.char(';');

const gap: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(ws)(P.seq(semicolon)(ws))
)(() => new AST.Gap());

// Parse 'let' keyword
const letKw = P.appfun(P.seq(P.str("let"))(ws1))(([_, __]) => null);

// Parse 'def' keyword
const defKw = P.appfun(P.seq(P.str("def"))(ws1))(([_, __]) => null);

// Parse variable name
const identifier = P.appfun(P.seq(P.many1(P.letter))(ws))(([letters, _ws]) => letters.join(''));

// Parse '='
const assign = P.appfun(P.seq(P.char('='))(ws))(([_eq, _ws]) => null);

// Parse atoms
const number: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(P.integer)(ws)
)(([n, _ws]) => new AST.Num(n));
const variable: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(P.many1(P.letter))(ws)
)(([letters, _ws]) => new AST.Var(letters.join('')));
const string: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.between(P.char('"'))(P.char('"'))(P.seq(P.many1(P.letter))(ws))
)(([letters, _ws]) => new AST.Str(letters.join('')));

// Parse operations
const opChar = P.choice(P.char('+'))(
  P.choice(P.char('-'))(
    P.choice(P.char('*'))(
      P.char('/')
    )
  )
);
const operator = P.appfun(P.seq(opChar)(ws))(([op, _ws]) => op);

// Parse parens
const paren: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(
    P.between(P.char('('))(P.char(')'))(
      P.appfun<any, AST.Expr>(P.seq(ws)(expr))(([, e]) => e)
    )
  )(ws)
)(([e]) => e);

const arr: P.IParser<AST.Expr> =
  P.appfun<any, AST.Expr>(
    P.between(
      P.char('[')
    )(P.char(']'))(
      P.seq(ws)(
        P.seq(expr)(
          P.many(
            P.seq(P.seq(ws)(P.char(',')))(P.seq(ws)(expr))
          )
        )
      )
    )
  )(
    ([_, [head, tail]]) =>
      new AST.Array([
        head,
        ...tail.map((t: any) => t[1][1])
      ])
  );

const argWithComma =
  P.appfun(
    P.seq(P.char(','))(P.seq(ws)(expr))
  )((value) => {
    const [, [, e]] = value as any;
    return e;
  });

const args: P.IParser<AST.Expr[]> =
  P.appfun<any, AST.Expr[]>(
    P.between(P.char('('))(P.char(')'))(
      P.seq(ws)(
        P.seq(expr)(P.many(argWithComma))
      )
    )
  )((result) => {
    const [_, [head, tail]] = result as [any, [AST.Expr, AST.Expr[]]];
    return [head, ...tail];
  });

// Function call
const funcCall: P.IParser<AST.Expr> =
  P.appfun<any, AST.Expr>(
    P.seq(P.many1(P.letter))(args)   // ← removed the inner seq + P.ws
  )(([letters, argList]) =>          // ← changed destructuring (no longer nested)
    new AST.Call(letters.join(''), argList)
  );

// Atoms: number, variable, or parentheses
const atom: P.IParser<AST.Expr> = P.choice<AST.Expr>(number)(
  P.choice<AST.Expr>(funcCall)(
    P.choice<AST.Expr>(variable)(
      P.choice<AST.Expr>(string)(
        P.choice<AST.Expr>(paren)(arr)
      )
      
    )
  )
);

// Parse expr
exprImpl.contents = P.appfun<any, AST.Expr>(
  P.seq(atom)(P.many(P.seq(operator)(atom)))
)(([head, rest]) => 
  rest.reduce(
    (acc, [op, right]) => AST.combining(acc, op, right), 
    head
  )
);

const param =
  P.appfun(P.seq(identifier)(ws))(([name]) => name);

const paramWithComma =
  P.appfun(
    P.seq(P.char(','))(P.seq(ws)(param))
  )
  ((value) => {
    const [, [, p]] = value as any;
    return p;
  });

const parameters =
  P.appfun(
    P.seq(
      P.between(P.char('('))(P.char(')'))(
        P.seq(param)(P.many(paramWithComma))
      )
    )(ws)
  )
  ((value) => {
    const [[head, tail]] = value as any;
    return [head, ...tail];
  });

// column letters
const colLetter = P.many1(P.letter);
// row digits
const rowNumber = P.many1(P.digit);

// The cell reference parser (e.g., A4)
const cellRef: P.IParser<{ col: string; row: number }> =
  P.appfun<any, { col: string; row: number }>(
    P.seq(colLetter)(rowNumber)
  )(([col, row]) => ({
    col: col.map((c: any) => c.toString()).join('').toUpperCase(),
    row: parseInt(row.map((d: any) => d.toString()).join(''), 10)
  }));

// We use P.ws1 to ensure there is space before "at"
const fixClause: P.IParser<{ col: string; row: number }> =
  P.appfun<any, { col: string; row: number }>(
    P.seq(P.ws)(
      P.seq(P.str("at"))(
        P.seq(P.ws1)(cellRef)
      )
    )
  )(([_, [__, [___, cell]]]) => cell);

// Update the let binding to use P.many for the optional clause
const letBinding: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(letKw)(
    P.seq(identifier)(
      P.seq(assign)(
        P.seq(expr)(P.many(fixClause)) 
      )
    )
  )
)(([_, [name, [__, [value, locationArray]]]]) => {
  const location = (locationArray as any[]).length > 0 ? locationArray[0] : undefined;
  return new AST.Let(name, value, location);
});

const defBinding: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(defKw)(
    P.seq(identifier)(
      P.seq(parameters)(
        P.seq(assign)(
          P.seq(expr)(P.many(fixClause)) 
        )
      )
    )
  )
)(([_, [name, [params, [__, [body, locationArray]]]]]) => {
  const location =
    (locationArray as any[]).length > 0
      ? locationArray[0]
      : undefined;

  return new AST.Def(name, params, body);
});

const letStmt: P.IParser<AST.Expr> =
  P.appfun<any, AST.Expr>(
    P.seq(letBinding)(
      P.seq(semicolon)(ws)
    )
  )(([expr, _]) => expr);

const defStmt: P.IParser<AST.Expr> =
  P.appfun<any, AST.Expr>(
    P.seq(defBinding)(
      P.seq(semicolon)(ws)
    )
  )(([expr, _]) => expr);

const statement: P.IParser<AST.Expr> =
  P.choice(defStmt)(
    P.choice(letStmt)(gap)
  );

// Parse multiple formulas
export const grammar = P.many1(statement);