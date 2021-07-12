"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operators_for_module = exports.operators_for_dict = void 0;
function operators_for_dict(keyword_to_atom, op_dict, op_name_lookup) {
    const d = {};
    for (const op of Object.keys(keyword_to_atom)) {
        const op_name = `op_${op_name_lookup[op] || op}`;
        const op_f = op_dict[op_name];
        if (typeof op_f === "function") {
            d[keyword_to_atom[op]] = op_f;
        }
    }
    return d;
}
exports.operators_for_dict = operators_for_dict;
function operators_for_module(keyword_to_atom, mod, op_name_lookup = {}) {
    return operators_for_dict(keyword_to_atom, mod, op_name_lookup);
}
exports.operators_for_module = operators_for_module;
