export var AST;
(function (AST) {
    class Num {
        constructor(value) {
            this.value = value;
        }
        evaluate() { return this; }
        toString() { return this.value.toString(); }
    }
    AST.Num = Num;
    class Bool {
        constructor(value) {
            this.value = value;
        }
        evaluate() { return this; }
        toString() { return this.value.toString(); }
    }
    AST.Bool = Bool;
    class Plus {
        constructor(left, right) {
            this.left = left;
            this.right = right;
        }
        evaluate() {
            const l = this.left.evaluate();
            const r = this.right.evaluate();
            return new Num(l.value + r.value);
        }
        toString() { return `(${this.left.toString()} + ${this.right.toString()})`; }
    }
    AST.Plus = Plus;
    class Minus {
        constructor(left, right) {
            this.left = left;
            this.right = right;
        }
        evaluate() {
            const l = this.left.evaluate();
            const r = this.right.evaluate();
            return new Num(l.value - r.value);
        }
        toString() { return `(${this.left.toString()} - ${this.right.toString()})`; }
    }
    AST.Minus = Minus;
    class Equal {
        constructor(left, right) {
            this.left = left;
            this.right = right;
        }
        evaluate() {
            const l = this.left.evaluate();
            const r = this.right.evaluate();
            if (l.value == r.value) {
                return new Num(r.value);
            }
            return new Bool(false);
        }
        toString() { return `(${this.left.toString()} = ${this.right.toString()})`; }
    }
    AST.Equal = Equal;
    function combining(left, middle, right) {
        switch (middle) {
            case "+":
                return new Plus(left, right);
            case "-":
                return new Minus(left, right);
            case "=":
                return new Equal(left, right);
            default:
                throw new Error(`Unknown operator: ${middle}`);
        }
    }
    AST.combining = combining;
})(AST || (AST = {}));
