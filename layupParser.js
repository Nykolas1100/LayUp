import { Primitives as P } from './parsecco/src';
import { AST } from './layupAST';
const [expr, exprImpl] = P.recParser();
// Parse separators
const ws = P.ws;
const ws1 = P.ws1;
const semicolon = P.char(';');
const gap = P.appfun(P.seq(ws)(P.seq(semicolon)(ws)))(() => new AST.Gap());
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
const opChar = P.choice(P.char('+'))(P.choice(P.char('-'))(P.choice(P.char('*'))(P.char('/'))));
const operator = P.appfun(P.seq(opChar)(ws))(([op, _ws]) => op);
// Flatten the middle: ws + expr => expr
const middle = P.appfun(P.seq(ws)(expr))(([_ws, e]) => e);
// Flatten the closing: ws + ')' => ignore
const close = P.appfun(P.seq(ws)(P.char(')')))(([_ws, _]) => null);
// Parse parens
const paren = P.appfun(P.seq(P.between(P.char('('))(P.char(')'))(P.appfun(P.seq(ws)(expr))(([, e]) => e)))(ws))(([e]) => e);
const arr = P.appfun(P.between(P.char('['))(P.char(']'))(P.seq(ws)(P.seq(expr)(P.many(P.seq(P.seq(ws)(P.char(',')))(P.seq(ws)(expr)))))))(([_, [head, tail]]) => new AST.Array([
    head,
    ...tail.map((t) => t[1][1])
]));
// Atoms: number, variable, or parentheses
const atom = P.choice(number)(P.choice(variable)(P.choice(paren)(arr)));
// Parse expr
exprImpl.contents = P.appfun(P.seq(atom)(P.many(P.seq(operator)(atom))))(([head, rest]) => rest.reduce((acc, [op, right]) => AST.combining(acc, op, right), head));
// column letters
const colLetter = P.many1(P.letter);
// row digits
const rowNumber = P.many1(P.digit);
// The cell reference parser (e.g., A4)
const cellRef = P.appfun(P.seq(colLetter)(rowNumber))(([col, row]) => ({
    col: col.map((c) => c.toString()).join('').toUpperCase(),
    row: parseInt(row.map((d) => d.toString()).join(''), 10)
}));
// We use P.ws1 to ensure there is space before "at"
const fixClause = P.appfun(P.seq(P.ws)(P.seq(P.str("at"))(P.seq(P.ws1)(cellRef))))(([_, [__, [___, cell]]]) => cell);
// Update the let binding to use P.many for the optional clause
const letBinding = P.appfun(P.seq(letKw)(P.seq(identifier)(P.seq(assign)(P.seq(expr)(P.many(fixClause))))))(([_, [name, [__, [value, locationArray]]]]) => {
    // Ensure locationArray is typed as the result of fixClause[]
    const location = locationArray.length > 0 ? locationArray[0] : undefined;
    return new AST.Let(name, value, location);
});
const letStmt = P.appfun(P.seq(letBinding)(P.seq(semicolon)(ws)))(([expr, _]) => expr);
const statement = P.choice(letStmt)(gap);
// Parse multiple formulas
export const grammar = P.many1(statement);
