export module AST {

    export type Value = number | string;

    export interface Expr {
        evaluate(env: Record<string, Expr>): Expr;
    }

    export class Let implements AST.Expr {
        constructor(public key: string, public valueExpr: AST.Expr) {}

        evaluate(env: Record<string, AST.Expr>): AST.Expr {
            const val = this.valueExpr.evaluate(env); // evaluate the value expression
            env[this.key] = val;                      // store it in the environment
            return val;                               // optionally return the value
        }

        toString() {
            return `let ${this.key} = ${this.valueExpr.toString()}`;
        }
    }

    export class Var implements Expr {
        constructor(public name: string) {}

        evaluate(env: Record<string, Expr>) {
            const v = env[this.name];
            if (!v) throw new Error("Unbound variable: " + this.name);
            return v;
        }

        toString() {
            return this.name;
        }
    }

    export class Num implements AST.Expr {
        constructor(public readonly value: number) {}

        evaluate(_: Record<string, AST.Expr>): AST.Expr {
            return this;
        }

        toString() {
            return this.value.toString();
        }
    }

}
