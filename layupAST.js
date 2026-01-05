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
})(AST || (AST = {}));
