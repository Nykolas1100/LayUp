import { Primitives as P, CharUtil as CU } from './parsecco/src';
import { AST } from './calcAST';
export const num = P.appfun(P.integer)((n) => new AST.Num(n));
const addition = P.char('+');
const subtraction = P.char('-');
const multiplication = P.char('x');
const division = P.char('/');
const op = P.choice(addition)(P.choice(subtraction)(P.choice(multiplication)(division)));
export const expr = P.appfun(P.seq(num)(P.many(P.seq(op)(num))))(([head, rest]) => rest.reduce((acc, [operator, right]) => AST.combining(acc, operator, right), head));
const grammar = P.left(expr)(P.eof);
const stream = new CU.CharStream("3-2+1");
const result = grammar(stream);
const parsed = result.next();
if (parsed.done) {
    if (parsed.value.tag == "success") {
        const ast = parsed.value.result;
        console.dir(ast, { depth: null });
        // Run evaluation here
        const output = ast.evaluate();
        console.log("Result:", output.toString());
    }
}
// const expression =
//   P.appfun(
//     P.seq(P.integer)(
//       P.many(
//         P.choice(
//           P.seq(addition)(P.integer))
//           (P.choice(
//             P.seq(subtraction)(P.integer))
//             (P.seq(multiplication)(P.integer))
//         )
//       )
//     ))
//     (([first, rest]) => {
//       let expr: AST.Expr = new AST.Num(first);
//       for (const [opToken, val] of rest) {
//             const op = opToken.toString();
//             expr = AST.combining(expr, op, new AST.Num(val));
//         }
//       return expr;
//     }
//   );
