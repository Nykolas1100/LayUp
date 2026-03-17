import { Primitives as P, CharUtil as CU } from './parsecco/src';
import { AST } from './layupAST';

const [expr, exprImpl] = P.recParser<AST.Expr>();

const singleComment: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(P.ws)(
    P.seq(P.char('#'))(
      P.seq(P.many(P.sat((c: string) => c !== '\n')))(P.char('\n'))
    )
  )
)(([_ws, [_hash, [chars, _newline]]]) => 
  new AST.Comment(chars.map((c: string) => c).join(''))
);

function maybe<T>(p: P.IParser<T>): P.IParser<T | undefined> {
  return P.appfun(P.many(p) as P.IParser<T[]>)(
    (arr: T[]) => arr.length > 0 ? arr[0] : undefined
  ) as P.IParser<T | undefined>;
}

const ws = P.ws;
const ws1 = P.ws1;
const semicolon = P.char(';');

const gap: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(ws)(P.seq(semicolon)(ws))
)(() => new AST.Gap());

// Parse pipe
const pipe = P.char('|');

// Parse 'let' keyword
const letKw = P.appfun(P.seq(P.str("let"))(ws1))(([_, __]) => null);

// Parse 'def' keyword
const defKw = P.appfun(P.seq(P.str("def"))(ws1))(([_, __]) => null);

// Parse variable name
const identifierRaw: P.IParser<string> = P.appfun<[CU.CharStream, CU.CharStream[]], string>(
  P.seq<CU.CharStream, CU.CharStream[]>(P.letter)(
    P.many<CU.CharStream>(P.choice<CU.CharStream>(P.letter)(P.digit))
  )
)(([first, rest]: [CU.CharStream, CU.CharStream[]]) =>
  first.toString() + rest.map(c => c.toString()).join('')
);

const identifier =
  P.appfun(
    P.seq(identifierRaw)(ws)
  )(([name, _]) => name);

// Parse '='
const assign = P.appfun(P.seq(P.char('='))(ws))(([_eq, _ws]) => null);

const sign = P.appfun(P.choices(P.char('-'), P.str("")))((sign) => sign);

const float = P.appfun(
  P.seq(sign)(
    P.seq(P.integer)(
      P.seq(P.char('.'))(P.integer)
    )
  )
)(
  ([sign, [left, [point, right]]]: [string, [string, [string, string]]]) => 
    sign + left + point + right
);

const signedInt = P.appfun(
  P.seq(sign)(P.integer)
)(
  ([sign, num]: [string, string]) => sign + num
);

const number: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(
    P.choices(float, signedInt)
  )(ws)
)(
  ([n, _ws]) => new AST.Num(parseFloat(n)) 
);

// Parse atoms
// const number: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
//   P.seq(P.choices(P.integer,))(ws)
// )(([n, _ws]) => new AST.Num(n));
const variable: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(identifierRaw)(ws)
)(([name, _]) => new AST.Var(name));
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

  const index: P.IParser<AST.Expr[]> =
  P.appfun<any, AST.Expr[]>(
    P.between(P.char('['))(P.char(']'))(
      P.seq(ws)(expr)
    )
  )(([_, e]) => [e]);

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

const param = P.appfun(P.seq(identifierRaw)(ws))(([name, _]) => name);

const paramWithComma = P.appfun(
  P.seq(P.char(','))(P.seq(ws)(param))
)((value) => {
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

const arrow = P.appfun(
  P.seq(ws)(P.seq(P.str("->"))(ws))
)(() => null);

const closureParams: P.IParser<string[]> =
  P.appfun<any, string[]>(
    P.between(pipe)(pipe)(
      P.seq(identifier)(P.many(paramWithComma))
    )
  )(([head, tail]) => [head, ...tail]);

const lambda: P.IParser<AST.Expr> =
  P.appfun<any, AST.Expr>(
    P.seq(closureParams)(
      P.seq(arrow)(expr)
    )
  )(([params, [_arrow, body]]) =>
    new AST.Lambda(params, body)
  );

const emptyArgs: P.IParser<AST.Expr[]> =
  P.appfun<any, AST.Expr[]>(
    P.seq(P.char('('))(P.seq(ws)(P.char(')')))
  )(_ => []);

const argsOrEmpty: P.IParser<AST.Expr[]> =
  P.choice<AST.Expr[]>(args)(emptyArgs);

type PostfixSuffix =
  | { kind: 'call'; args: AST.Expr[] }
  | { kind: 'index'; idx: AST.Expr };

const callSuffix: P.IParser<PostfixSuffix> =
  P.appfun<any, PostfixSuffix>(argsOrEmpty)(
    (args) => ({ kind: 'call', args })
  );

const indexSuffix: P.IParser<PostfixSuffix> =
  P.appfun<any, PostfixSuffix>(
    P.between(P.char('['))(P.char(']'))(
      P.seq(ws)(expr)
    )
  )(([_, e]) => ({ kind: 'index', idx: e }));

const postfixSuffix: P.IParser<PostfixSuffix> =
  P.choice<PostfixSuffix>(callSuffix)(indexSuffix);

// Atoms: lambda, number, string, varOrCall, parentheses, array
const atom: P.IParser<AST.Expr> = P.choice(lambda)(
  P.choice(number)(
    P.choice(string)(
      P.choice(variable)(
        P.choice(paren)(arr)
      )
    )
  )
);


const postfix: P.IParser<AST.Expr> =
  P.appfun<any, AST.Expr>(
    P.seq(atom)(P.many(postfixSuffix))
  )(([base, suffixes]) =>
    suffixes.reduce((acc: AST.Expr, suffix: PostfixSuffix) => {
      if (suffix.kind === 'call') {
        return new AST.Call(acc, suffix.args);
      } else {
        return new AST.Index(acc, suffix.idx); // add AST.Index to your AST
      }
    }, base)
  );

// Parse expr
exprImpl.contents = P.appfun<any, AST.Expr>(
  P.seq(postfix)(P.many(P.seq(operator)(postfix)))  // <-- postfix here
)(([head, rest]) =>
  rest.reduce(
    (acc, [op, right]) => AST.combining(acc, op, right),
    head
  )
);

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

const fixClause: P.IParser<{ col: string; row: number }> =
  P.appfun<any, { col: string; row: number }>(
    P.seq(P.ws)(
      P.seq(P.str("at"))(
        P.seq(P.ws1)(cellRef)
      )
    )
  )(([_, [__, [___, cell]]]) => cell);

const direction =
  P.appfun(
    P.seq(P.ws)(
      P.choice(
        P.appfun(P.str("right"))(() => "right")
      )(
        P.appfun(P.str("down"))(() => "down")
      )
    )
  )(([, dir]) => dir);

// Update the let binding to use P.many for the optional clause
const letBinding: P.IParser<AST.Expr> = P.appfun<any, AST.Expr>(
  P.seq(letKw)(
    P.seq(identifier)(
      P.seq(assign)(
        P.seq(expr)(
          P.seq(maybe(fixClause))(
            maybe(direction)
          )
        )
      )
    )
  )
)(([_, [name, [__, [value, [location, direction]]]]]) => {
  const validLocation = (location && location.col && location.row) 
    ? location 
    : undefined;

  return new AST.Let(name, value, validLocation, direction);
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

  // Desugar into a Let + Lambda
  return new AST.Let(
    name, 
    new AST.Lambda(params, body),
    location
  );
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
  P.choice(singleComment)(
    P.choice(defStmt)(
      P.choice(letStmt)(gap)
    ));

// Parse multiple formulas
export const grammar = P.many1(statement);