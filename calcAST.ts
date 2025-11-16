export module AST {
  export interface Expr {
    evaluate(): Expr;
  }

  export class Num implements Expr {
    public readonly value: number;

    constructor(value: number) {
      this.value = value;
    }
    evaluate() { return this; }
    toString() { return this.value.toString(); }
  }

  export class Bool implements Expr {
    public readonly value: boolean;

    constructor(value: boolean) {
        this.value = value
    }
    evaluate() { return this; }
    toString() { return this.value.toString(); }
  }

  export class Plus implements Expr {
    public readonly left: Expr;
    public readonly right: Expr;

    constructor(left: Expr, right: Expr) {
        this.left = left;
        this.right = right;
    }

    evaluate() {
        const l = this.left.evaluate() as Num;
        const r = this.right.evaluate() as Num;
        return new Num(l.value + r.value);
    }
    toString() { return `(${this.left.toString()} + ${this.right.toString()})`; }
  }

  export class Minus implements Expr {
    public readonly left: Expr;
    public readonly right: Expr;

    constructor(left: Expr, right: Expr) {
        this.left = left;
        this.right = right;
    }

    evaluate() {
        const l = this.left.evaluate() as Num;
        const r = this.right.evaluate() as Num;
        return new Num(l.value - r.value);
    }
    toString() { return `(${this.left.toString()} - ${this.right.toString()})`; }
  }

  export class Equal implements Expr {
    public readonly left: Expr;
    public readonly right: Expr;

    constructor(left: Expr, right: Expr) {
        this.left = left;
        this.right = right;
    }

    evaluate() {
        const l = this.left.evaluate() as Num;
        const r = this.right.evaluate() as Num;
        if(l.value == r.value){
            return new Num(r.value);
        }
        return new Bool(false);
    }
    toString() { return `(${this.left.toString()} = ${this.right.toString()})`; }
  }

  export function combining(left: Expr, middle: string, right: Expr): Expr {
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

}
