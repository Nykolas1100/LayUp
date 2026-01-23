(() => {
  // parsecco/src/charstream.ts
  var CharUtil;
  ((CharUtil2) => {
    class CharStream2 {
      constructor(s, startpos, endpos, hasEOF) {
        // end index into input (exclusive)
        this.hasEOF = true;
        this.input = s;
        if (startpos == void 0) {
          this.startpos = 0;
        } else if (startpos > s.length) {
          this.startpos = s.length;
        } else {
          this.startpos = startpos;
        }
        if (endpos == void 0) {
          this.endpos = s.length;
        } else if (endpos > s.length) {
          this.endpos = s.length;
        } else {
          this.endpos = endpos;
        }
        if (this.startpos > this.endpos) {
          this.startpos = this.endpos;
        }
        if (hasEOF != void 0) {
          this.hasEOF = hasEOF;
        }
      }
      /**
       * Returns true of the end of the input has been reached.
       */
      isEOF() {
        return this.hasEOF && this.startpos == this.input.length;
      }
      /**
       * Returns a Javscript primitive string of the slice of input
       * represented by this CharStream.
       */
      toString() {
        return this.input.substring(this.startpos, this.endpos);
      }
      /**
       * Returns a new CharStream representing the input from the
       * current start position to an end position num chars from
       * the current start position.  If startpos + num > endpos,
       * the current CharStream is returned.
       * @param num
       */
      peek(num) {
        if (this.startpos + num >= this.endpos) {
          return this;
        } else {
          const newHasEOF = this.startpos + num == this.endpos && this.hasEOF;
          return new CharStream2(this.input, this.startpos, this.startpos + num, newHasEOF);
        }
      }
      /**
       * Returns true if the next s.length characters match s.
       * @param s A string.
       */
      peekMatches(s) {
        if (this.startpos + s.length > this.endpos) {
          return false;
        } else {
          return this.input.substring(this.startpos, this.startpos + s.length) === s;
        }
      }
      /**
       * Returns a new CharStream created by repeatedly applying the given
       * predicate until it no longer matches.
       * @param pred A predicate over valid characters.
       */
      seekWhile(pred) {
        let pos = this.startpos;
        let end = this.endpos;
        while (pos < end && pred(this.input.charAt(pos))) {
          pos++;
        }
        return new CharStream2(this.input, pos, end, pos == end);
      }
      /**
       * A highly optimized seek that advances the stream while the given
       * predicate returns true.  Returns a pair of CharStreams [a,b] where
       * a is the matching string and b is the remainder of the stream.
       * @param okCodes A predicate over valid ASCII character codes.
       */
      seekWhileCharCode(okCodes) {
        let pos = this.startpos;
        let end = this.endpos;
        while (pos < end && okCodes(this.input.charCodeAt(pos))) {
          pos++;
        }
        return [
          new CharStream2(this.input, this.startpos, pos, pos == end),
          new CharStream2(this.input, pos, end, this.hasEOF)
        ];
      }
      /**
       * Returns a new CharStream representing the string after
       * seeking num characters from the current position.
       * @param num
       */
      seek(num) {
        if (this.startpos + num > this.endpos) {
          return new CharStream2(this.input, this.endpos, this.endpos, this.hasEOF);
        } else {
          return new CharStream2(this.input, this.startpos + num, this.endpos, this.hasEOF);
        }
      }
      /**
       * Returns a new CharStream representing the head of the input at
       * the current position.  Throws an exception if the CharStream is
       * empty.
       */
      head() {
        if (!this.isEmpty()) {
          const newHasEOF = this.startpos + 1 == this.endpos && this.hasEOF;
          return new CharStream2(this.input, this.startpos, this.startpos + 1, newHasEOF);
        } else {
          throw new Error("Cannot get the head of an empty string.");
        }
      }
      /**
       * Returns a new CharStream representing the tail of the input at
       * the current position.  Throws an exception if the CharStream is
       * empty.
       */
      tail() {
        if (!this.isEmpty()) {
          return new CharStream2(this.input, this.startpos + 1, this.endpos, this.hasEOF);
        } else {
          throw new Error("Cannot get the tail of an empty string.");
        }
      }
      /**
       * Returns true if the input at the current position is empty. Note
       * that a CharStream at the end of the input contains an empty
       * string but that an empty string may not be the end-of-file (i.e.,
       * isEOF is false).
       */
      isEmpty() {
        return this.startpos == this.endpos;
      }
      /**
       * Returns the number of characters remaining at
       * the current position.
       */
      length() {
        return this.endpos - this.startpos;
      }
      /**
       * Returns the substring between start and end at the
       * current position.
       * @param start the start index of the substring, inclusive
       * @param end the end index of the substring, exclusive
       */
      substring(start, end) {
        const start2 = this.startpos + start;
        const end2 = this.startpos + end;
        const newHasEOF = this.endpos == end2 && this.hasEOF;
        return new CharStream2(this.input, start2, end2, newHasEOF);
      }
      /**
       * Returns the concatenation of the current CharStream with
       * the given CharStream. Note: returned object does not
       * reuse original input string, and startpos and endpos
       * are reset. If the given CharStream contains EOF, the
       * concatenated CharStream will also contain EOF.
       * @param cs the CharStream to concat to this CharStream
       */
      concat(cs) {
        const s = this.toString() + cs.toString();
        return new CharStream2(s, 0, s.length, cs.hasEOF);
      }
      /**
       * Concatenate an array of CharStream objects into a single
       * CharStream object.
       * @param css a CharStream[]
       */
      static concat(css) {
        if (css.length == 0) {
          return new CharStream2("", 0, 0, false);
        } else {
          let cs = css[0];
          for (let i = 1; i < css.length; i++) {
            cs = cs.concat(css[i]);
          }
          return cs;
        }
      }
    }
    CharUtil2.CharStream = CharStream2;
  })(CharUtil || (CharUtil = {}));

  // parsecco/src/primitives.ts
  var CharStream = CharUtil.CharStream;
  var Primitives;
  ((Primitives2) => {
    Primitives2.PAD = 10;
    class EOFMark {
      constructor() {
      }
      static get Instance() {
        return this._instance || (this._instance = new this());
      }
    }
    Primitives2.EOFMark = EOFMark;
    Primitives2.EOF = EOFMark.Instance;
    class Success {
      /**
       * Returns an object representing a successful parse.
       * @param istream The remaining string.
       * @param res The result of the parse
       */
      constructor(istream, res) {
        this.tag = "success";
        this.inputstream = istream;
        this.result = res;
      }
    }
    Primitives2.Success = Success;
    class Failure {
      /**
       * Returns an object representing a failed parse.
       * If the failure is critical, then parsing will stop immediately.
       *
       * @param istream The string, unmodified, that was given to the parser.
       * @param error_pos The position of the parsing failure in istream.
       * @param error_msg The error message for the failure.
       * @param is_critical Whether or not the failure should cause an enclosing choice to fail (i.e., short-circuit).
       */
      constructor(istream, error_pos, error_msg = "", is_critical = false) {
        this.tag = "failure";
        this.inputstream = istream;
        this.error_pos = error_pos;
        this.error_msg = error_msg;
        this.is_critical = is_critical;
      }
    }
    Primitives2.Failure = Failure;
    function result2(v) {
      return function* (istream) {
        return new Success(istream, v);
      };
    }
    Primitives2.result = result2;
    function recParser() {
      const dumbParser = (_input) => {
        throw new Error("You forgot to initialize your recursive parser.");
      };
      const r = { contents: dumbParser };
      const p = (input) => r.contents(input);
      return [p, r];
    }
    Primitives2.recParser = recParser;
    function rec1ArgParser() {
      const dumbParser = (_arg) => (_input) => {
        throw new Error("You forgot to initialize your recursive parser.");
      };
      const r = { contents: dumbParser };
      const p = (arg) => (input) => r.contents(arg)(input);
      return [p, r];
    }
    Primitives2.rec1ArgParser = rec1ArgParser;
    function zero(msg) {
      return function* (istream) {
        return new Failure(istream, istream.startpos, msg);
      };
    }
    Primitives2.zero = zero;
    function fail(p) {
      return function(msg) {
        return function* (istream) {
          const o = yield* p(istream);
          switch (o.tag) {
            case "success":
              return new Failure(istream, istream.startpos, msg, false);
            case "failure":
              return new Success(istream, void 0);
          }
        };
      };
    }
    Primitives2.fail = fail;
    function ok(res) {
      return function* (istream) {
        return new Success(istream, res);
      };
    }
    Primitives2.ok = ok;
    function expect(parser) {
      return function(error_msg) {
        return function* (istream) {
          const outcome = yield* parser(istream);
          switch (outcome.tag) {
            case "success":
              return outcome;
            case "failure":
              return outcome.is_critical ? outcome : new Failure(istream, istream.startpos, error_msg, true);
          }
        };
      };
    }
    Primitives2.expect = expect;
    Primitives2.item = function* (istream) {
      if (istream.isEmpty()) {
        return new Failure(istream, istream.startpos);
      } else {
        const remaining = istream.tail();
        const res = istream.head();
        return new Success(remaining, res);
      }
    };
    function bind(p) {
      return function(f) {
        return function* (istream) {
          const r = yield* p(istream);
          switch (r.tag) {
            case "success":
              const o = yield* f(r.result)(r.inputstream);
              switch (o.tag) {
                case "success":
                  break;
                case "failure":
                  return new Failure(istream, o.error_pos, o.error_msg, o.is_critical);
              }
              return o;
            case "failure":
              return new Failure(istream, r.error_pos, r.error_msg, r.is_critical);
          }
        };
      };
    }
    Primitives2.bind = bind;
    function delay(p) {
      return () => p;
    }
    Primitives2.delay = delay;
    function seq(p) {
      return (q) => {
        return bind(p)((t) => {
          return bind(q)((u) => {
            return result2([t, u]);
          });
        });
      };
    }
    Primitives2.seq = seq;
    function sat(p) {
      const f = function(x) {
        const char2 = x.toString();
        if (char2.length !== 1) throw new Error("Input to predicate must be a character.");
        return p(char2) ? result2(x) : function* (istream) {
          return new Failure(istream, istream.startpos - 1);
        };
      };
      return bind(Primitives2.item)(f);
    }
    Primitives2.sat = sat;
    function satClass(char_class) {
      const f = (x) => {
        return char_class.indexOf(x.toString()) > -1 ? result2(x) : function* (istream) {
          return new Failure(istream, istream.startpos - 1);
        };
      };
      return bind(Primitives2.item)(f);
    }
    Primitives2.satClass = satClass;
    function char(c) {
      if (c.length != 1) {
        throw new Error("char parser takes a string of length 1 (i.e., a char)");
      }
      return satClass([c]);
    }
    Primitives2.char = char;
    Primitives2.lower_chars = "abcdefghijklmnopqrstuvwxyz".split("");
    Primitives2.upper_chars = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");
    Primitives2.letter = satClass(Primitives2.lower_chars.concat(Primitives2.upper_chars));
    Primitives2.digit = satClass(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    Primitives2.integer = appfun(many1(Primitives2.digit))((arr2) => {
      const s = CharStream.concat(arr2).toString();
      return parseFloat(s);
    });
    Primitives2.float = choice(
      pipe2(Primitives2.integer)(right(char("."))(Primitives2.integer))(
        (a, b) => parseFloat(a.toString() + "." + b.toString())
      )
    )(Primitives2.integer);
    Primitives2.upper = satClass(Primitives2.upper_chars);
    Primitives2.lower = satClass(Primitives2.lower_chars);
    function choice(p1) {
      return (p2) => {
        return function* (istream) {
          const o = yield* p1(istream);
          switch (o.tag) {
            case "success":
              return o;
            case "failure":
              if (o.is_critical) {
                return o;
              }
              const o2 = yield* p2(istream);
              switch (o2.tag) {
                case "success":
                  break;
                case "failure":
                  return o2.is_critical || o2.error_pos >= o.error_pos ? o2 : o;
              }
              return o2;
          }
        };
      };
    }
    Primitives2.choice = choice;
    function choices(...parsers) {
      if (parsers.length == 0) {
        throw new Error("Error: choices must have a non-empty array.");
      }
      return function* (istream) {
        let i = 0;
        while (i < parsers.length) {
          const o = yield* parsers[i](istream);
          if (o.tag === "success") {
            return o;
          } else if (o.is_critical) {
            return o;
          }
          i++;
        }
        return new Failure(istream, istream.startpos);
      };
    }
    Primitives2.choices = choices;
    function prefix(pre) {
      return (p) => {
        return (f) => {
          return function* (istream) {
            const output1 = yield* pre(istream);
            switch (output1.tag) {
              case "success":
                const output2 = yield* p(output1.inputstream);
                switch (output2.tag) {
                  case "success":
                    return new Success(output2.inputstream, f(output1.result, output2.result));
                  case "failure":
                    return output1;
                }
              case "failure":
                return output1;
            }
          };
        };
      };
    }
    Primitives2.prefix = prefix;
    function appfun(p) {
      return (f) => {
        return function* (istream) {
          const o = yield* p(istream);
          switch (o.tag) {
            case "success":
              return new Success(o.inputstream, f(o.result));
            case "failure":
              return o;
          }
        };
      };
    }
    Primitives2.appfun = appfun;
    Primitives2.pipe = appfun;
    function pipe2(p) {
      return (q) => {
        return (f) => {
          return bind(p)((t) => {
            return bind(q)((u) => {
              return result2(f(t, u));
            });
          });
        };
      };
    }
    Primitives2.pipe2 = pipe2;
    function pipe3(p1) {
      return (p2) => {
        return (p3) => {
          return (f) => {
            return pipe2(
              // parse p1
              p1
            )(
              pipe2(
                // then parse p2
                p2
              )(
                // then parse p3
                p3
              )(
                // then return a tuple (b,c)
                (b, c) => [b, c]
              )
            )(
              // then apply f to all of a, b, c
              (a, [b, c]) => f(a, b, c)
            );
          };
        };
      };
    }
    Primitives2.pipe3 = pipe3;
    function many(p) {
      return function* (istream) {
        let istream2 = istream;
        const outputs = [];
        let succeeds = true;
        while (!istream2.isEmpty() && succeeds) {
          const o = yield* p(istream2);
          switch (o.tag) {
            case "success":
              if (istream2 == o.inputstream) {
                throw new Error("Parser loops infinitely.");
              }
              istream2 = o.inputstream;
              outputs.push(o.result);
              break;
            case "failure":
              succeeds = false;
              break;
          }
        }
        return new Success(istream2, outputs);
      };
    }
    Primitives2.many = many;
    function many1(p) {
      return (istream) => {
        return pipe2(p)(many(p))((hd, tl) => {
          tl.unshift(hd);
          return tl;
        })(istream);
      };
    }
    Primitives2.many1 = many1;
    function str(s) {
      return function* (istream) {
        if (istream.peekMatches(s)) {
          return new Success(istream.seek(s.length), new CharStream(s));
        } else {
          return new Failure(istream, istream.startpos);
        }
      };
    }
    Primitives2.str = str;
    Primitives2.eof = function* (istream) {
      return istream.isEOF() ? new Success(istream, Primitives2.EOF) : new Failure(istream, istream.startpos);
    };
    function fresult(p) {
      return (x) => {
        return (istream) => {
          return bind(p)((_t) => result2(x))(istream);
        };
      };
    }
    Primitives2.fresult = fresult;
    function left(p) {
      return (q) => {
        return (istream) => {
          return bind(p)((t) => fresult(q)(t))(istream);
        };
      };
    }
    Primitives2.left = left;
    function right(p) {
      return (q) => {
        return (istream) => {
          return bind(p)((_) => q)(istream);
        };
      };
    }
    Primitives2.right = right;
    function between(popen) {
      return (pclose) => {
        return (p) => {
          const l = left(p)(pclose);
          const r = right(popen)(l);
          return r;
        };
      };
    }
    Primitives2.between = between;
    function debug(p) {
      return (label) => {
        return function* (istream) {
          console.log("apply: " + label + ", startpos: " + istream.startpos + ", endpos: " + istream.endpos);
          const o = yield* p(istream);
          switch (o.tag) {
            case "success":
              console.log("success: " + label + ", startpos: " + istream.startpos + ", endpos: " + istream.endpos);
              break;
            case "failure":
              console.log(
                "failure: " + label + ", startpos: " + istream.startpos + ", endpos: " + istream.endpos + "\n" + diagnosticMessage(o, Primitives2.PAD)
              );
              break;
          }
          return o;
        };
      };
    }
    Primitives2.debug = debug;
    function windowLeftIndex(windowSz, failurePos) {
      return failurePos - windowSz < 0 ? 0 : failurePos - windowSz;
    }
    function windowRightIndex(windowSz, failurePos, bufferLen) {
      return failurePos + windowSz >= bufferLen ? bufferLen - 1 : failurePos + windowSz;
    }
    function indexOfLastNewlineLeftWindow(leftIndex, failurePos, buffer) {
      function searchBackward(pos) {
        if (pos <= leftIndex) {
          return -1;
        } else if (buffer[pos] === "\n") {
          return pos;
        } else {
          return searchBackward(pos - 1);
        }
      }
      const idx = searchBackward(failurePos - 1);
      return idx === -1 ? leftIndex : idx;
    }
    function indexOfFirstNewlineRightWindow(rightIndex, failurePos, buffer) {
      function searchForward(pos) {
        if (pos >= rightIndex) {
          return -1;
        } else if (buffer[pos] === "\n") {
          return pos;
        } else {
          return searchForward(pos + 1);
        }
      }
      const idx = searchForward(failurePos - 1);
      return idx === -1 ? rightIndex : idx;
    }
    function leftPad(s, padStr, num) {
      return num > 0 ? leftPad(padStr + s, padStr, num - 1) : s;
    }
    function diagnosticMessage(fail2, windowSz) {
      const failurePos = fail2.error_pos;
      const buffer = fail2.inputstream.input.toString();
      const err = fail2.error_msg;
      const leftIdx = windowLeftIndex(windowSz, failurePos);
      const rightIdx = windowRightIndex(windowSz, failurePos, buffer.length);
      const afterLastNLLeft = indexOfLastNewlineLeftWindow(leftIdx, failurePos, buffer) + 1;
      const beforeFirstNLRight = indexOfFirstNewlineRightWindow(rightIdx, failurePos, buffer) - 1;
      const winLeftIdx = Math.max(leftIdx, afterLastNLLeft);
      const winRightIdx = Math.min(rightIdx, beforeFirstNLRight);
      const window2 = buffer.substr(winLeftIdx, winRightIdx - winLeftIdx + 1);
      const caretPos = failurePos - winLeftIdx + 1;
      const diag = leftPad("", "=", winRightIdx - winLeftIdx + 1) + "\n" + err + "\n" + window2 + "\n" + leftPad("^", " ", caretPos - 1) + "\n" + leftPad("", "=", winRightIdx - winLeftIdx + 1) + "\n";
      return diag;
    }
    Primitives2.diagnosticMessage = diagnosticMessage;
    Primitives2.nl = Primitives2.choice(Primitives2.str("\n"))(Primitives2.str("\r\n"));
    const wschars = choice(satClass([" ", "	"]))(Primitives2.nl);
    Primitives2.ws = function* (istream) {
      const o = yield* many(wschars)(istream);
      switch (o.tag) {
        case "success":
          return new Success(o.inputstream, CharStream.concat(o.result));
        case "failure":
          return o;
      }
    };
    Primitives2.ws1 = function* (istream) {
      const o = yield* many1(wschars)(istream);
      switch (o.tag) {
        case "success":
          return new Success(o.inputstream, CharStream.concat(o.result));
        case "failure":
          return o;
      }
    };
    function groupBy(list, keyGetter) {
      const m = /* @__PURE__ */ new Map();
      list.forEach((elem) => {
        const key = keyGetter(elem);
        if (!m.has(key)) {
          m.set(key, []);
        }
        const collection = m.get(key);
        collection.push(elem);
      });
      return m;
    }
    function strSat(strs) {
      const smap = groupBy(strs, (s) => s.length);
      const sizes = [];
      smap.forEach((vals, key, _m) => {
        sizes.push(key);
        vals.sort();
      });
      sizes.sort().reverse();
      return function* (istream) {
        for (let peekIndex = 0; peekIndex < sizes.length; peekIndex++) {
          const peek = istream.peek(sizes[peekIndex]);
          const tail = istream.seek(sizes[peekIndex]);
          const candidates = smap.get(sizes[peekIndex]);
          for (let cIndex = 0; cIndex < candidates.length; cIndex++) {
            if (candidates[cIndex] === peek.toString()) {
              return new Success(tail, peek);
            }
          }
        }
        return new Failure(istream, istream.startpos);
      };
    }
    Primitives2.strSat = strSat;
    function matchWhile(pred) {
      return function* (istream) {
        const rem = istream.seekWhile(pred);
        const diff = rem.startpos - istream.startpos;
        if (diff == 0) {
          return new Failure(istream, istream.startpos);
        } else {
          const match = istream.peek(diff);
          return yield* result2(match)(rem);
        }
      };
    }
    Primitives2.matchWhile = matchWhile;
    function matchWhileCharCode(pred) {
      return function* (istream) {
        const [match, rem] = istream.seekWhileCharCode(pred);
        if (match.startpos == match.endpos) {
          return new Failure(istream, istream.startpos);
        }
        return yield* result2(match)(rem);
      };
    }
    Primitives2.matchWhileCharCode = matchWhileCharCode;
  })(Primitives || (Primitives = {}));

  // layupAST.ts
  var AST;
  ((AST3) => {
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
        if (this.location) {
          return `let ${this.key} = ${this.valueExpr.toString()} at ${this.location.col}${this.location.row}`;
        }
        return `let ${this.key} = ${this.valueExpr.toString()}`;
      }
    }
    AST3.Let = Let;
    class Array {
      constructor(value) {
        this.value = value;
      }
      evaluate(env) {
        return new Array(
          this.value.map((e) => e.evaluate(env))
        );
      }
      toString() {
        return `[${this.value.join(", ")}]`;
      }
    }
    AST3.Array = Array;
    class Var {
      constructor(name) {
        this.name = name;
      }
      evaluate(env) {
        const v = env[this.name];
        if (!v) throw new Error("Unbound variable: " + this.name);
        return v;
      }
      toString() {
        return this.name;
      }
    }
    AST3.Var = Var;
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
    AST3.Num = Num;
    function isNum(e) {
      return e instanceof AST3.Num;
    }
    AST3.isNum = isNum;
    function isArray(e) {
      return e instanceof AST3.Array;
    }
    AST3.isArray = isArray;
    class Plus {
      constructor(left, right) {
        this.left = left;
        this.right = right;
      }
      evaluate(env) {
        const l = this.left.evaluate(env);
        const r = this.right.evaluate(env);
        if (isNum(l) && isNum(r)) {
          return new Num(l.value + r.value);
        }
        if (isArray(l) && isNum(r)) {
          return new Array(
            l.value.map(
              (e) => new Plus(e, r).evaluate(env)
            )
          );
        }
        if (isNum(l) && isArray(r)) {
          return new Array(
            r.value.map(
              (e) => new Plus(l, e).evaluate(env)
            )
          );
        }
        if (isArray(l) && isArray(r)) {
          if (l.value.length !== r.value.length) {
            throw new Error("Array length mismatch in +");
          }
          return new Array(
            l.value.map(
              (e, i) => new Plus(e, r.value[i]).evaluate(env)
            )
          );
        }
        throw new Error("Invalid operands for +");
      }
      toString() {
        return `(${this.left.toString()} + ${this.right.toString()})`;
      }
    }
    AST3.Plus = Plus;
    class Minus {
      constructor(left, right) {
        this.left = left;
        this.right = right;
      }
      evaluate(env) {
        const l = this.left.evaluate(env);
        const r = this.right.evaluate(env);
        if (isNum(l) && isNum(r)) {
          return new Num(l.value - r.value);
        }
        if (isArray(l) && isNum(r)) {
          return new Array(
            l.value.map(
              (e) => new Minus(e, r).evaluate(env)
            )
          );
        }
        if (isNum(l) && isArray(r)) {
          return new Array(
            r.value.map(
              (e) => new Minus(l, e).evaluate(env)
            )
          );
        }
        if (isArray(l) && isArray(r)) {
          if (l.value.length !== r.value.length) {
            throw new Error("Array length mismatch in -");
          }
          return new Array(
            l.value.map(
              (e, i) => new Minus(e, r.value[i]).evaluate(env)
            )
          );
        }
        throw new Error("Invalid operands for -");
      }
      toString() {
        return `(${this.left.toString()} - ${this.right.toString()})`;
      }
    }
    AST3.Minus = Minus;
    class Times {
      constructor(left, right) {
        this.left = left;
        this.right = right;
      }
      evaluate(env) {
        const l = this.left.evaluate(env);
        const r = this.right.evaluate(env);
        if (isNum(l) && isNum(r)) {
          return new Num(l.value * r.value);
        }
        if (isArray(l) && isNum(r)) {
          return new Array(
            l.value.map(
              (e) => new Times(e, r).evaluate(env)
            )
          );
        }
        if (isNum(l) && isArray(r)) {
          return new Array(
            r.value.map(
              (e) => new Times(l, e).evaluate(env)
            )
          );
        }
        if (isArray(l) && isArray(r)) {
          if (l.value.length !== r.value.length) {
            throw new Error("Array length mismatch in +");
          }
          return new Array(
            l.value.map(
              (e, i) => new Times(e, r.value[i]).evaluate(env)
            )
          );
        }
        throw new Error("Invalid operands for *");
      }
      toString() {
        return `(${this.left.toString()} * ${this.right.toString()})`;
      }
    }
    AST3.Times = Times;
    class Div {
      constructor(left, right) {
        this.left = left;
        this.right = right;
      }
      evaluate(env) {
        const l = this.left.evaluate(env);
        const r = this.right.evaluate(env);
        if (isNum(l) && isNum(r)) {
          return new Num(l.value / r.value);
        }
        if (isArray(l) && isNum(r)) {
          return new Array(
            l.value.map(
              (e) => new Div(e, r).evaluate(env)
            )
          );
        }
        if (isNum(l) && isArray(r)) {
          return new Array(
            r.value.map(
              (e) => new Div(l, e).evaluate(env)
            )
          );
        }
        if (isArray(l) && isArray(r)) {
          if (l.value.length !== r.value.length) {
            throw new Error("Array length mismatch in /");
          }
          return new Array(
            l.value.map(
              (e, i) => new Div(e, r.value[i]).evaluate(env)
            )
          );
        }
        throw new Error("Invalid operands for /");
      }
      toString() {
        return `(${this.left.toString()} / ${this.right.toString()})`;
      }
    }
    AST3.Div = Div;
    function combining(left, middle2, right) {
      switch (middle2.toString()) {
        case "+":
          return new Plus(left, right);
        case "-":
          return new Minus(left, right);
        case "*":
          return new Times(left, right);
        case "/":
          return new Div(left, right);
        default:
          throw new Error(`Unknown operator: ${middle2}`);
      }
    }
    AST3.combining = combining;
  })(AST || (AST = {}));

  // layupParser.js
  var [expr, exprImpl] = Primitives.recParser();
  var ws = Primitives.ws;
  var ws1 = Primitives.ws1;
  var semicolon = Primitives.char(";");
  var letKw = Primitives.appfun(Primitives.seq(Primitives.str("let"))(ws1))(([_, __]) => null);
  var identifier = Primitives.appfun(Primitives.seq(Primitives.many1(Primitives.letter))(ws))(([letters, _ws]) => letters.join(""));
  var assign = Primitives.appfun(Primitives.seq(Primitives.char("="))(ws))(([_eq, _ws]) => null);
  var number = Primitives.appfun(Primitives.seq(Primitives.integer)(ws))(([n, _ws]) => new AST.Num(n));
  var variable = Primitives.appfun(Primitives.seq(Primitives.many1(Primitives.letter))(ws))(([letters, _ws]) => new AST.Var(letters.join("")));
  var opChar = Primitives.choice(Primitives.char("+"))(Primitives.choice(Primitives.char("-"))(Primitives.choice(Primitives.char("*"))(Primitives.char("/"))));
  var operator = Primitives.appfun(Primitives.seq(opChar)(ws))(([op, _ws]) => op);
  var middle = Primitives.appfun(Primitives.seq(ws)(expr))(([_ws, e]) => e);
  var close = Primitives.appfun(Primitives.seq(ws)(Primitives.char(")")))(([_ws, _]) => null);
  var paren = Primitives.appfun(Primitives.seq(Primitives.between(Primitives.char("("))(Primitives.char(")"))(Primitives.appfun(Primitives.seq(ws)(expr))(([, e]) => e)))(ws))(([e]) => e);
  var arr = Primitives.appfun(Primitives.between(Primitives.char("["))(Primitives.char("]"))(Primitives.seq(ws)(Primitives.seq(expr)(Primitives.many(Primitives.seq(Primitives.seq(ws)(Primitives.char(",")))(Primitives.seq(ws)(expr)))))))(([_, [head, tail]]) => new AST.Array([
    head,
    ...tail.map((t) => t[1][1])
  ]));
  var atom = Primitives.choice(number)(Primitives.choice(variable)(Primitives.choice(paren)(arr)));
  exprImpl.contents = Primitives.appfun(Primitives.seq(atom)(Primitives.many(Primitives.seq(operator)(atom))))(([head, rest]) => rest.reduce((acc, [op, right]) => AST.combining(acc, op, right), head));
  var colLetter = Primitives.many1(Primitives.letter);
  var rowNumber = Primitives.many1(Primitives.digit);
  var cellRef = Primitives.appfun(Primitives.seq(colLetter)(rowNumber))(([col, row]) => ({
    col: col.map((c) => c.toString()).join("").toUpperCase(),
    row: parseInt(row.map((d) => d.toString()).join(""), 10)
  }));
  var fixClause = Primitives.appfun(Primitives.seq(Primitives.ws)(Primitives.seq(Primitives.str("at"))(Primitives.seq(Primitives.ws1)(cellRef))))(([_, [__, [___, cell]]]) => cell);
  var letBinding = Primitives.appfun(Primitives.seq(letKw)(Primitives.seq(identifier)(Primitives.seq(assign)(Primitives.seq(expr)(Primitives.many(fixClause))))))(([_, [name, [__, [value, locationArray]]]]) => {
    const location = locationArray.length > 0 ? locationArray[0] : void 0;
    return new AST.Let(name, value, location);
  });
  var grammar = Primitives.many1(Primitives.appfun(Primitives.seq(letBinding)(Primitives.seq(semicolon)(Primitives.many(Primitives.nl))))(([formula, _]) => formula));
  var stream = new CharUtil.CharStream("let x = 1 + 4; let y = x * 3;");
  var result = grammar(stream);
  var parsed = result.next();
  if (parsed.done && parsed.value.tag === "success") {
    const env = {};
    const astList = parsed.value.result;
    for (const line of astList) {
      line.evaluate(env);
    }
    console.log(env);
  }

  // layupAST.js
  var AST2;
  (function(AST3) {
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
        if (this.location) {
          return `let ${this.key} = ${this.valueExpr.toString()} at ${this.location.col}${this.location.row}`;
        }
        return `let ${this.key} = ${this.valueExpr.toString()}`;
      }
    }
    AST3.Let = Let;
    class Array {
      constructor(value) {
        this.value = value;
      }
      evaluate(env) {
        return new Array(this.value.map((e) => e.evaluate(env)));
      }
      toString() {
        return `[${this.value.join(", ")}]`;
      }
    }
    AST3.Array = Array;
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
    AST3.Var = Var;
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
    AST3.Num = Num;
    function isNum(e) {
      return e instanceof AST3.Num;
    }
    AST3.isNum = isNum;
    function isArray(e) {
      return e instanceof AST3.Array;
    }
    AST3.isArray = isArray;
    class Plus {
      constructor(left, right) {
        this.left = left;
        this.right = right;
      }
      evaluate(env) {
        const l = this.left.evaluate(env);
        const r = this.right.evaluate(env);
        if (isNum(l) && isNum(r)) {
          return new Num(l.value + r.value);
        }
        if (isArray(l) && isNum(r)) {
          return new Array(l.value.map((e) => new Plus(e, r).evaluate(env)));
        }
        if (isNum(l) && isArray(r)) {
          return new Array(r.value.map((e) => new Plus(l, e).evaluate(env)));
        }
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
    AST3.Plus = Plus;
    class Minus {
      constructor(left, right) {
        this.left = left;
        this.right = right;
      }
      evaluate(env) {
        const l = this.left.evaluate(env);
        const r = this.right.evaluate(env);
        if (isNum(l) && isNum(r)) {
          return new Num(l.value - r.value);
        }
        if (isArray(l) && isNum(r)) {
          return new Array(l.value.map((e) => new Minus(e, r).evaluate(env)));
        }
        if (isNum(l) && isArray(r)) {
          return new Array(r.value.map((e) => new Minus(l, e).evaluate(env)));
        }
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
    AST3.Minus = Minus;
    class Times {
      constructor(left, right) {
        this.left = left;
        this.right = right;
      }
      evaluate(env) {
        const l = this.left.evaluate(env);
        const r = this.right.evaluate(env);
        if (isNum(l) && isNum(r)) {
          return new Num(l.value * r.value);
        }
        if (isArray(l) && isNum(r)) {
          return new Array(l.value.map((e) => new Times(e, r).evaluate(env)));
        }
        if (isNum(l) && isArray(r)) {
          return new Array(r.value.map((e) => new Times(l, e).evaluate(env)));
        }
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
    AST3.Times = Times;
    class Div {
      constructor(left, right) {
        this.left = left;
        this.right = right;
      }
      evaluate(env) {
        const l = this.left.evaluate(env);
        const r = this.right.evaluate(env);
        if (isNum(l) && isNum(r)) {
          return new Num(l.value / r.value);
        }
        if (isArray(l) && isNum(r)) {
          return new Array(l.value.map((e) => new Div(e, r).evaluate(env)));
        }
        if (isNum(l) && isArray(r)) {
          return new Array(r.value.map((e) => new Div(l, e).evaluate(env)));
        }
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
    AST3.Div = Div;
    function combining(left, middle2, right) {
      switch (middle2.toString()) {
        case "+":
          return new Plus(left, right);
        case "-":
          return new Minus(left, right);
        case "*":
          return new Times(left, right);
        case "/":
          return new Div(left, right);
        default:
          throw new Error(`Unknown operator: ${middle2}`);
      }
    }
    AST3.combining = combining;
  })(AST2 || (AST2 = {}));

  // webParser.js
  function parseCode(code) {
    try {
      const stream2 = new CharUtil.CharStream(code);
      const result2 = grammar(stream2);
      const parsed2 = result2.next();
      if (parsed2.done && parsed2.value.tag === "success") {
        const env = {};
        const astList = parsed2.value.result;
        const outputs = [];
        for (const line of astList) {
          const val = line.evaluate(env);
          outputs.push(val);
        }
        return { ast: astList, env, output: outputs };
      }
      return { error: "Parse failed", details: parsed2 };
    } catch (e) {
      return { error: e.message, details: e.stack };
    }
  }
  window.parseCode = parseCode;
})();
