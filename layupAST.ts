export module AST {

    export type Value = number | string;

    export interface Expr {
        evaluate(env: Record<string, Expr>): Expr;
    }

    export class Let implements AST.Expr {
    constructor(public key: string, public valueExpr: AST.Expr) {}

    evaluate(env: Record<string, AST.Expr>): AST.Expr {
        // Evaluate the RHS (e.g., Var("x") becomes Num(1))
        const val = this.valueExpr.evaluate(env);
        // Store the concrete value in the environment
        env[this.key] = val;
        return val;
    }

        toString() {
            return `let ${this.key} = ${this.valueExpr.toString()}`;
        }
    }

    export class Array implements AST.Expr {
        constructor(public readonly value: AST.Expr[]) {}

        evaluate(env: Record<string, AST.Expr>): AST.Expr {
            return new Array(
                this.value.map(e => e.evaluate(env))
            );
        }

        toString() {
            return `[${this.value.join(", ")}]`;
        }
    }


    export class Var implements Expr {
        constructor(public name: string) {}

        evaluate(env: Record<string, Expr>): Expr {
            const v = env[this.name];
            if (!v) throw new Error("Unbound variable: " + this.name);
            return v.evaluate(env);
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

    export class Plus implements Expr {
        constructor(
            public readonly left: Expr,
            public readonly right: Expr
        ) {}

        evaluate(env: Record<string, Expr>): Expr {
            const l = this.left.evaluate(env) as Num;
            const r = this.right.evaluate(env) as Num;
            return new Num(l.value + r.value);
        }

        toString() {
            return `(${this.left.toString()} + ${this.right.toString()})`;
        }
    }

    export class Minus implements Expr {
        constructor(
            public readonly left: Expr,
            public readonly right: Expr
        ) {}

        evaluate(env: Record<string, Expr>): Expr {
            const l = this.left.evaluate(env) as Num;
            const r = this.right.evaluate(env) as Num;
            return new Num(l.value - r.value);
        }

        toString() {
            return `(${this.left.toString()} - ${this.right.toString()})`;
        }
    }

    export class Times implements Expr {
        constructor(
            public readonly left: Expr,
            public readonly right: Expr
        ) {}

        evaluate(env: Record<string, Expr>): Expr {
            const l = this.left.evaluate(env) as Num;
            const r = this.right.evaluate(env) as Num;
            return new Num(l.value * r.value);
        }

        toString() {
            return `(${this.left.toString()} * ${this.right.toString()})`;
        }
    }

    export class Div implements Expr {
        constructor(
            public readonly left: Expr,
            public readonly right: Expr
        ) {}

        evaluate(env: Record<string, Expr>): Expr {
            const l = this.left.evaluate(env) as Num;
            const r = this.right.evaluate(env) as Num;
            return new Num(l.value / r.value);
        }

        toString() {
            return `(${this.left.toString()} / ${this.right.toString()})`;
        }
    }

    export function combining(left: Expr, middle: string, right: Expr): Expr {

        switch (middle.toString()) {
            case "+":
                return new Plus(left, right);
            case "-":
                return new Minus(left, right);
            case "*":
                return new Times(left, right);
            case "/":
                return new Div(left, right);
            default:
                throw new Error(`Unknown operator: ${middle}`);
        }
    }


}
