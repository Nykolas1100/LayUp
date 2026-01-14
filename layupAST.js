export var AST;
(function (AST) {
    class Let {
        constructor(key, valueExpr) {
            this.key = key;
            this.valueExpr = valueExpr;
        }
        evaluate(env) {
            const val = this.valueExpr.evaluate(env);
            env[this.key] = val;
            return val;
        }
        toString() {
            return `let ${this.key} = ${this.valueExpr.toString()}`;
        }
    }
    AST.Let = Let;
    class Var {
        constructor(name) {
            this.name = name;
        }
        evaluate(env) {
            const v = env[this.name];
            if (!v)
                throw new Error("Unbound variable: " + this.name);
            return v;
        }
        toString() {
            return this.name;
        }
    }
    AST.Var = Var;
    class Num {
        constructor(value) {
            this.value = value;
        }
        evaluate(_) {
            return this;
        }
        toString() {
            return this.value.toString();
        }
    }
    AST.Num = Num;
    class Plus {
        constructor(left, right) {
            this.left = left;
            this.right = right;
        }
        evaluate(env) {
            const l = this.left.evaluate(env);
            const r = this.right.evaluate(env);
            return new Num(l.value + r.value);
        }
        toString() {
            return `(${this.left.toString()} + ${this.right.toString()})`;
        }
    }
    AST.Plus = Plus;
    class Minus {
        constructor(left, right) {
            this.left = left;
            this.right = right;
        }
        evaluate(env) {
            const l = this.left.evaluate(env);
            const r = this.right.evaluate(env);
            return new Num(l.value - r.value);
        }
        toString() {
            return `(${this.left.toString()} - ${this.right.toString()})`;
        }
    }
    AST.Minus = Minus;
    class Times {
        constructor(left, right) {
            this.left = left;
            this.right = right;
        }
        evaluate(env) {
            const l = this.left.evaluate(env);
            const r = this.right.evaluate(env);
            return new Num(l.value * r.value);
        }
        toString() {
            return `(${this.left.toString()} * ${this.right.toString()})`;
        }
    }
    AST.Times = Times;
    class Div {
        constructor(left, right) {
            this.left = left;
            this.right = right;
        }
        evaluate(env) {
            const l = this.left.evaluate(env);
            const r = this.right.evaluate(env);
            return new Num(l.value / r.value);
        }
        toString() {
            return `(${this.left.toString()} / ${this.right.toString()})`;
        }
    }
    AST.Div = Div;
    function combining(left, middle, right) {
        switch (middle) {
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
    AST.combining = combining;
})(AST || (AST = {}));
