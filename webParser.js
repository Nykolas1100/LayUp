import { grammar } from "./layupParser.ts";
import { CharUtil } from "./parsecco/src/index.ts";
import { AST } from "./layupAST.ts";
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';

export function parseCode(code) {
    try {
        const stream = new CharUtil.CharStream(code);
        const result = grammar(stream);
        const parsed = result.next();
        if (parsed.done && parsed.value.tag === "success") {
            const env = {};
            const astEnv = {};
            const astList = parsed.value.result;
            const outputs = [];
            for (const line of astList) {
                const val = line.evaluate(env);
                outputs.push(val);
                if (line.key && line.valueExpr) {
                    astEnv[line.key] = line.valueExpr;
                }
            }
            return { ast: astList, env, astEnv, output: outputs };
        }
        return { error: "Parse failed", details: parsed };
    } catch (e) {
        return { error: e.message, details: e.stack };
    }
}

export { AST };

window.jspreadsheet = jspreadsheet;
window.parseCode = parseCode;
window.AST = AST;
