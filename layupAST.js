"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AST = void 0;
var AST;
(function (AST) {
    var Let = /** @class */ (function () {
        function Let(key, valueExpr) {
            this.key = key;
            this.valueExpr = valueExpr;
        }
        Let.prototype.evaluate = function (env) {
            var val = this.valueExpr.evaluate(env); // evaluate the value expression
            env[this.key] = val; // store it in the environment
            return val; // optionally return the value
        };
        Let.prototype.toString = function () {
            return "let ".concat(this.key, " = ").concat(this.valueExpr.toString());
        };
        return Let;
    }());
    AST.Let = Let;
    var Var = /** @class */ (function () {
        function Var(name) {
            this.name = name;
        }
        Var.prototype.evaluate = function (env) {
            var v = env[this.name];
            if (!v)
                throw new Error("Unbound variable: " + this.name);
            return v;
        };
        Var.prototype.toString = function () {
            return this.name;
        };
        return Var;
    }());
    AST.Var = Var;
    var Num = /** @class */ (function () {
        function Num(value) {
            this.value = value;
        }
        Num.prototype.evaluate = function (_) {
            return this;
        };
        Num.prototype.toString = function () {
            return this.value.toString();
        };
        return Num;
    }());
    AST.Num = Num;
})(AST || (exports.AST = AST = {}));
