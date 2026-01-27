export var AST;
(function (AST) {
    class Let {
        constructor(key, valueExpr, location) {
            this.key = key;
            this.valueExpr = valueExpr;
            this.location = location;
        }
        evaluate(env) {
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
    AST.Let = Let;
    class Array {
        constructor(value) {
            this.value = value;
        }
        evaluate(env) {
            return new Array(this.value.map(e => e.evaluate(env)));
        }
        toString() {
            return `[${this.value.join(", ")}]`;
        }
    }
    AST.Array = Array;
    class Gap {
        evaluate(_) {
            return this;
        }
        toString() {
            return `Gap`;
        }
    }
    AST.Gap = Gap;
    class Var {
        constructor(name) {
            this.name = name;
        }
        evaluate(env) {
            const v = env[this.name];
            if (!v)
                throw new Error("Unbound variable: " + this.name);
            // return v.evaluate(env);
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
    function isNum(e) {
        return e instanceof AST.Num;
    }
    AST.isNum = isNum;
    function isArray(e) {
        return e instanceof AST.Array;
    }
    AST.isArray = isArray;
    class Plus {
        constructor(left, right) {
            this.left = left;
            this.right = right;
        }
        evaluate(env) {
            const l = this.left.evaluate(env);
            const r = this.right.evaluate(env);
            // Num + Num
            if (isNum(l) && isNum(r)) {
                return new Num(l.value + r.value);
            }
            // Array + Num
            if (isArray(l) && isNum(r)) {
                return new Array(l.value.map(e => new Plus(e, r).evaluate(env)));
            }
            // Num + Array
            if (isNum(l) && isArray(r)) {
                return new Array(r.value.map(e => new Plus(l, e).evaluate(env)));
            }
            // Array + Array
            if (isArray(l) && isArray(r)) {
                if (l.value.length !== r.value.length) {
                    throw new Error("Array length mismatch in +");
                }
                return new Array(l.value.map((e, i) => new Plus(e, r.value[i]).evaluate(env)));
            }
            throw new Error("Invalid operands for +");
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
            // Num - Num
            if (isNum(l) && isNum(r)) {
                return new Num(l.value - r.value);
            }
            // Array - Num
            if (isArray(l) && isNum(r)) {
                return new Array(l.value.map(e => new Minus(e, r).evaluate(env)));
            }
            // Num - Array
            if (isNum(l) && isArray(r)) {
                return new Array(r.value.map(e => new Minus(l, e).evaluate(env)));
            }
            // Array - Array
            if (isArray(l) && isArray(r)) {
                if (l.value.length !== r.value.length) {
                    throw new Error("Array length mismatch in -");
                }
                return new Array(l.value.map((e, i) => new Minus(e, r.value[i]).evaluate(env)));
            }
            throw new Error("Invalid operands for -");
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
            // Num * Num
            if (isNum(l) && isNum(r)) {
                return new Num(l.value * r.value);
            }
            // Array * Num
            if (isArray(l) && isNum(r)) {
                return new Array(l.value.map(e => new Times(e, r).evaluate(env)));
            }
            // Num * Array
            if (isNum(l) && isArray(r)) {
                return new Array(r.value.map(e => new Times(l, e).evaluate(env)));
            }
            // Array * Array
            if (isArray(l) && isArray(r)) {
                if (l.value.length !== r.value.length) {
                    throw new Error("Array length mismatch in +");
                }
                return new Array(l.value.map((e, i) => new Times(e, r.value[i]).evaluate(env)));
            }
            throw new Error("Invalid operands for *");
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
            // Num / Num
            if (isNum(l) && isNum(r)) {
                return new Num(l.value / r.value);
            }
            // Array / Num
            if (isArray(l) && isNum(r)) {
                return new Array(l.value.map(e => new Div(e, r).evaluate(env)));
            }
            // Num / Array
            if (isNum(l) && isArray(r)) {
                return new Array(r.value.map(e => new Div(l, e).evaluate(env)));
            }
            // Array / Array
            if (isArray(l) && isArray(r)) {
                if (l.value.length !== r.value.length) {
                    throw new Error("Array length mismatch in /");
                }
                return new Array(l.value.map((e, i) => new Div(e, r.value[i]).evaluate(env)));
            }
            throw new Error("Invalid operands for /");
        }
        toString() {
            return `(${this.left.toString()} / ${this.right.toString()})`;
        }
    }
    AST.Div = Div;
    function combining(left, middle, right) {
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
    AST.combining = combining;
})(AST || (AST = {}));
