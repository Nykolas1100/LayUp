import { init } from "z3-solver";

async function main(){
  const z3 = await init();

  const {Context} = z3;
  const ctx = new Context("main");
  const solver = new ctx.Solver();
  const x = ctx.Int.const("x");
  const y = ctx.Int.const("y");

  solver.add(x.add(y).eq(10));
  solver.add(x.gt(0));
  solver.add(y.gt(0));

  const result = await solver.check();
  console.log("Result: " + result);

  if (result == "sat") {
    const model = solver.model();
    console.log("Model:" + model);
  }
}

main();