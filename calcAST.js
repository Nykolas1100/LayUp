"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AST = void 0;
var AST;
(function (AST) {
    var Num = /** @class */ (function () {
        function Num(value) {
            this.value = value;
        }
        Num.prototype.evaluate = function () { return this; };
        Num.prototype.toString = function () { return this.value.toString(); };
        return Num;
    }());
    AST.Num = Num;
    var Bool = /** @class */ (function () {
        function Bool(value) {
            this.value = value;
        }
        Bool.prototype.evaluate = function () { return this; };
        Bool.prototype.toString = function () { return this.value.toString(); };
        return Bool;
    }());
    AST.Bool = Bool;
    var Plus = /** @class */ (function () {
        function Plus(left, right) {
            this.left = left;
            this.right = right;
        }
        Plus.prototype.evaluate = function () {
            var l = this.left.evaluate();
            var r = this.right.evaluate();
            return new Num(l.value + r.value);
        };
        Plus.prototype.toString = function () { return "(".concat(this.left.toString(), " + ").concat(this.right.toString(), ")"); };
        return Plus;
    }());
    AST.Plus = Plus;
    var Minus = /** @class */ (function () {
        function Minus(left, right) {
            this.left = left;
            this.right = right;
        }
        Minus.prototype.evaluate = function () {
            var l = this.left.evaluate();
            var r = this.right.evaluate();
            return new Num(l.value - r.value);
        };
        Minus.prototype.toString = function () { return "(".concat(this.left.toString(), " - ").concat(this.right.toString(), ")"); };
        return Minus;
    }());
    AST.Minus = Minus;
    var Equal = /** @class */ (function () {
        function Equal(left, right) {
            this.left = left;
            this.right = right;
        }
        Equal.prototype.evaluate = function () {
            var l = this.left.evaluate();
            var r = this.right.evaluate();
            if (l.value == r.value) {
                return new Num(r.value);
            }
            return new Bool(false);
        };
        Equal.prototype.toString = function () { return "(".concat(this.left.toString(), " = ").concat(this.right.toString(), ")"); };
        return Equal;
    }());
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
                throw new Error("Unknown operator: ".concat(middle));
        }
    }
    AST.combining = combining;
})(AST || (exports.AST = AST = {}));
