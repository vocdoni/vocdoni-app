import ts from 'typescript';
import { getPropertyValues } from '../../typescript/ast-helpers.js';
export const getSrcDir = (sourceFile) => {
    const srcDir = 'src';
    function visit(node) {
        if (ts.isObjectLiteralExpression(node)) {
            const values = getPropertyValues(node, 'srcDir');
            if (values.size > 0) {
                return Array.from(values)[0];
            }
        }
        let result;
        ts.forEachChild(node, innerNode => {
            const innerValue = visit(innerNode);
            if (innerValue) {
                result = innerValue;
                return true;
            }
            return false;
        });
        return result;
    }
    return visit(sourceFile) ?? srcDir;
};
