"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.as_javascript = void 0;
const __type_compatibility__1 = require("./__type_compatibility__");
function as_javascript(sexp) {
    function _roll(op_stack, val_stack) {
        const v1 = val_stack.pop();
        const v2 = val_stack.pop();
        val_stack.push(v1);
        val_stack.push(v2);
    }
    function _make_tuple(op_stack, val_stack) {
        const left = val_stack.pop();
        const right = val_stack.pop();
        if (right.equal_to(__type_compatibility__1.Bytes.NULL)) {
            val_stack.push([left]);
        }
        else {
            val_stack.push(__type_compatibility__1.t(left, right));
        }
    }
    function _extend_list(op_stack, val_stack) {
        const left = [val_stack.pop()];
        const right = val_stack.pop();
        left.concat(right);
        val_stack.push(left);
    }
    function _as_javascript(op_stack, val_stack) {
        const v = val_stack.pop();
        const pair = v.as_pair();
        if (pair) {
            const [left, right] = pair.as_array();
            if (right.listp()) {
                op_stack.push(_extend_list);
            }
            else {
                op_stack.push(_make_tuple);
            }
            op_stack.push(_as_javascript);
            op_stack.push(_roll);
            op_stack.push(_as_javascript);
            val_stack.push(left);
            val_stack.push(right);
        }
        else {
            val_stack.push(v.atom);
        }
    }
    const op_stack = [_as_javascript];
    const val_stack = [sexp];
    while (op_stack.length) {
        const op_f = op_stack.pop();
        op_f && op_f(op_stack, val_stack);
    }
    return val_stack[val_stack.length - 1];
}
exports.as_javascript = as_javascript;
