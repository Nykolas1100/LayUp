import { Primitives as P, CharUtil as CU } from './parsecco/src';
import { AST } from './calcAST';

const addition = P.char('+');
const subtraction = P.char('-');

const equation =
  P.appfun(
    P.seq(P.integer)(
      P.many(
        P.choice(
          P.seq(addition)(P.integer))
          (P.seq(subtraction)(P.integer)
        )
      )
    ))
    (([first, rest]) => {
      let expr: AST.Expr = new AST.Num(first);

      for (const [opToken, val] of rest) {
            const op = opToken.toString();
            expr = AST.combining(expr, op, new AST.Num(val));
        }


      return expr;
    }
  );

// const equation = P.seq(P.integer)(P.many(P.choice(P.seq(addition)(P.integer)) (P.seq(subtraction) (P.integer))));

const grammar = P.left(equation) (P.eof);

const stream = new CU.CharStream("3-2+1");
const result = grammar(stream);
const parsed = result.next();
if (parsed.done) {
    if (parsed.value.tag == "success") {
        const ast = parsed.value.result as AST.Expr;
        console.dir(ast, { depth: null });

        // Run evaluation here
        const output = ast.evaluate();
        console.log("Result:", output.toString());
    }
}