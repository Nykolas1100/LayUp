export module AST {

    export type Value = number | string;

    export interface Expr {
        evaluate(env: Record<string, Expr>): Expr;
    }

    export class Let implements AST.Expr {
        constructor(
            public key: string,
            public valueExpr: AST.Expr,
            public location?: { col: string; row: number }
        ) {}

        evaluate(env: Record<string, AST.Expr>): AST.Expr {
            const val = this.valueExpr.evaluate(env);
            env[this.key] = val;
            return val;
        }

        toString() {
            // Include location in string representation if present
            if (this.location) {
                return `let ${this.key} = ${this.valueExpr.toString()} at ${this.location.col}${this.location.row}`;
            }
            return `let ${this.key} = ${this.valueExpr.toString()}`;
        }
    }

    export class Closure implements AST.Expr {
        constructor(
            public parameters: string[],
            public body: AST.Expr,
            public capturedEnv: Record<string, AST.Expr>
        ) {}

        evaluate(_: Record<string, AST.Expr>): AST.Expr {
            return this;
        }

        toString() {
            return `fn(${this.parameters.join(", ")}) { ${this.body.toString()} }`;
        }
    }

    export class Def implements AST.Expr {
        constructor(
            public key: string,
            public parameters: string[],
            public body: AST.Expr
        ) {}

        evaluate(env: Record<string, AST.Expr>): AST.Expr {
            const closure = new Closure(this.parameters, this.body, { ...env });
            
            // Bind the function to its name in the environment
            env[this.key] = closure;
            closure.capturedEnv[this.key] = closure; 
            
            return closure;
        }

        toString() {
            return `def ${this.key}(${this.parameters.join(", ")}) = ${this.body.toString()}`;
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

    export class Gap implements AST.Expr {
        evaluate(_: Record<string, AST.Expr>): AST.Expr {
            return this;
        }

        toString() {
            return `Gap`;
        }
    }

    export class Var implements Expr {
        constructor(public name: string) {}

        evaluate(env: Record<string, Expr>): Expr {
            const v = env[this.name];
            if (!v) throw new Error("Unbound variable: " + this.name);
            // return v.evaluate(env);
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

    export function isNum(e: AST.Expr): e is AST.Num {
        return e instanceof AST.Num;
    }

    export function isArray(e: AST.Expr): e is AST.Array {
        return e instanceof AST.Array;
    }

    export class Plus implements Expr {
        public readonly op = "+";
        constructor(
            public readonly left: Expr,
            public readonly right: Expr
        ) {}

        evaluate(env: Record<string, Expr>): Expr {
            const l = this.left.evaluate(env);
            const r = this.right.evaluate(env);

            // Num + Num
            if (isNum(l) && isNum(r)) {
                return new Num(l.value + r.value);
            }

            // Array + Num
            if (isArray(l) && isNum(r)) {
                return new Array(
                    l.value.map(e =>
                        new Plus(e, r).evaluate(env)
                    )
                );
            }

            // Num + Array
            if (isNum(l) && isArray(r)) {
                return new Array(
                    r.value.map(e =>
                        new Plus(l, e).evaluate(env)
                    )
                );
            }

            // Array + Array
            if (isArray(l) && isArray(r)) {
                if (l.value.length !== r.value.length) {
                    throw new Error("Array length mismatch in +");
                }
                return new Array(
                    l.value.map((e, i) =>
                        new Plus(e, r.value[i]).evaluate(env)
                    )
                );
            }

            throw new Error("Invalid operands for +");
        }

        toString() {
            return `(${this.left.toString()} + ${this.right.toString()})`;
        }
    }

    export class Minus implements Expr {
        public readonly op = "-";
        constructor(
            public readonly left: Expr,
            public readonly right: Expr
        ) {}

        evaluate(env: Record<string, Expr>): Expr {
            const l = this.left.evaluate(env);
            const r = this.right.evaluate(env);

            // Num - Num
            if (isNum(l) && isNum(r)) {
                return new Num(l.value - r.value);
            }

            // Array - Num
            if (isArray(l) && isNum(r)) {
                return new Array(
                    l.value.map(e =>
                        new Minus(e, r).evaluate(env)
                    )
                );
            }

            // Num - Array
            if (isNum(l) && isArray(r)) {
                return new Array(
                    r.value.map(e =>
                        new Minus(l, e).evaluate(env)
                    )
                );
            }

            // Array - Array
            if (isArray(l) && isArray(r)) {
                if (l.value.length !== r.value.length) {
                    throw new Error("Array length mismatch in -");
                }
                return new Array(
                    l.value.map((e, i) =>
                        new Minus(e, r.value[i]).evaluate(env)
                    )
                );
            }

            throw new Error("Invalid operands for -");
        }

        toString() {
            return `(${this.left.toString()} - ${this.right.toString()})`;
        }
    }

    export class Times implements Expr {
        public readonly op = "*";
        constructor(
            public readonly left: Expr,
            public readonly right: Expr
        ) {}

        evaluate(env: Record<string, Expr>): Expr {
            const l = this.left.evaluate(env);
            const r = this.right.evaluate(env);

            // Num * Num
            if (isNum(l) && isNum(r)) {
                return new Num(l.value * r.value);
            }

            // Array * Num
            if (isArray(l) && isNum(r)) {
                return new Array(
                    l.value.map(e =>
                        new Times(e, r).evaluate(env)
                    )
                );
            }

            // Num * Array
            if (isNum(l) && isArray(r)) {
                return new Array(
                    r.value.map(e =>
                        new Times(l, e).evaluate(env)
                    )
                );
            }

            // Array * Array
            if (isArray(l) && isArray(r)) {
                if (l.value.length !== r.value.length) {
                    throw new Error("Array length mismatch in +");
                }
                return new Array(
                    l.value.map((e, i) =>
                        new Times(e, r.value[i]).evaluate(env)
                    )
                );
            }

            throw new Error("Invalid operands for *");
        }

        toString() {
            return `(${this.left.toString()} * ${this.right.toString()})`;
        }
    }

    export class Div implements Expr {
        public readonly op = "/";
        constructor(
            public readonly left: Expr,
            public readonly right: Expr
        ) {}

        evaluate(env: Record<string, Expr>): Expr {
            const l = this.left.evaluate(env);
            const r = this.right.evaluate(env);

            // Num / Num
            if (isNum(l) && isNum(r)) {
                return new Num(l.value / r.value);
            }

            // Array / Num
            if (isArray(l) && isNum(r)) {
                return new Array(
                    l.value.map(e =>
                        new Div(e, r).evaluate(env)
                    )
                );
            }

            // Num / Array
            if (isNum(l) && isArray(r)) {
                return new Array(
                    r.value.map(e =>
                        new Div(l, e).evaluate(env)
                    )
                );
            }

            // Array / Array
            if (isArray(l) && isArray(r)) {
                if (l.value.length !== r.value.length) {
                    throw new Error("Array length mismatch in /");
                }
                return new Array(
                    l.value.map((e, i) =>
                        new Div(e, r.value[i]).evaluate(env)
                    )
                );
            }

            throw new Error("Invalid operands for /");
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

    export class Call implements AST.Expr {
        constructor(
            public target: string,
            public args: AST.Expr[]
        ) {}

        evaluate(env: Record<string, AST.Expr>): AST.Expr {
            // Find Function in environment
            const func = env[this.target];
            if (!(func instanceof Closure)) {
                throw new Error(`${this.target} is not a function`);
            }

            // Check arity
            if (this.args.length !== func.parameters.length) {
                throw new Error(`Arity mismatch in ${this.target}: expected ${func.parameters.length}, got ${this.args.length}`);
            }

            // Evaluate arguments outside of the function
            const evaluatedArgs = this.args.map(arg => arg.evaluate(env));

            // Create a new local environment for the function execution
            const localEnv = { ...func.capturedEnv };

            // Bind evaluated arguments to the parameter names
            func.parameters.forEach((paramName, i) => {
                localEnv[paramName] = evaluatedArgs[i];
            });

            // Evaluate and return the function body in the new local environment
            return func.body.evaluate(localEnv);
        }

        toString() {
            return `${this.target}(${this.args.map(a => a.toString()).join(", ")})`;
        }
    }

}
