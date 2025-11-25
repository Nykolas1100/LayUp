import { grammar } from "./layupParser.js";
import { CharUtil } from "./parsecco/src";
import { AST } from "./layupAST.js";

function parseCode(code) {
    try {
        const stream = new CharUtil.CharStream(code);
        const result = grammar(stream);
        const parsed = result.next();

        if (parsed.done && parsed.value.tag === "success") {
            const env = {};
            const astList = parsed.value.result;

            const outputs = [];
            for (const line of astList) {
                const val = line.evaluate(env);
                outputs.push(val);
            }

            return { ast: astList, env, output: outputs };
        }

        return { error: "Parse failed", details: parsed };
    } catch (e) {
        return { error: e.message, details: e.stack };
    }
}

window.parseCode = parseCode;
