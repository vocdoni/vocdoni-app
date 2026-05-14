export { applyStaticReplace };
import { transformAsync } from '@babel/core';
import * as t from '@babel/types';
import { parseImportString } from '../../shared/importString.js';
import { assert } from '../../../../utils/assert.js';
import '../../assertEnvVite.js';
// ============================================================================
// Main transformer
// ============================================================================
async function applyStaticReplace(code, staticReplaceList, id, env) {
    assert(staticReplaceList.length > 0);
    const SKIPPED = undefined;
    const NO_CHANGE = null;
    const staticReplaceListFiltered = staticReplaceList.filter((staticReplace) => {
        if (staticReplace.env && staticReplace.env !== env)
            return false;
        if (!code.includes(staticReplace.filter))
            return false;
        return true;
    });
    if (staticReplaceListFiltered.length === 0) {
        return SKIPPED;
    }
    try {
        const state = {
            modified: false,
            imports: new Map(),
            alreadyUnreferenced: new Set(),
        };
        const result = await transformAsync(code, {
            filename: id,
            ast: true,
            sourceMaps: true,
            plugins: [
                collectImportsPlugin(state),
                applyRulesPlugin(state, staticReplaceListFiltered),
                removeUnreferencedPlugin(state),
            ],
        });
        if (!result?.code || !state.modified) {
            return NO_CHANGE;
        }
        return { code: result.code, map: result.map };
    }
    catch (error) {
        console.error(`Error transforming ${id}:`, error);
        return SKIPPED;
    }
}
// ============================================================================
// Helpers
// ============================================================================
function valueToAst(value) {
    if (value === null)
        return t.nullLiteral();
    if (value === undefined)
        return t.identifier('undefined');
    if (typeof value === 'string')
        return t.stringLiteral(value);
    if (typeof value === 'number')
        return t.numericLiteral(value);
    if (typeof value === 'boolean')
        return t.booleanLiteral(value);
    if (Array.isArray(value)) {
        return t.arrayExpression(value.map(valueToAst));
    }
    if (typeof value === 'object') {
        const properties = Object.entries(value).map(([key, val]) => {
            return t.objectProperty(t.identifier(key), valueToAst(val));
        });
        return t.objectExpression(properties);
    }
    return t.callExpression(t.memberExpression(t.identifier('JSON'), t.identifier('parse')), [
        t.stringLiteral(JSON.stringify(value)),
    ]);
}
function getCalleeName(callee) {
    if (t.isIdentifier(callee))
        return callee.name;
    if (t.isMemberExpression(callee) && t.isIdentifier(callee.property))
        return callee.property.name;
    return null;
}
/**
 * Check if an identifier matches an import condition
 */
function matchesImport(arg, parsed, state) {
    if (!t.isIdentifier(arg))
        return false;
    const imported = state.imports.get(arg.name);
    if (!imported)
        return false;
    return imported.importPath === parsed.importPath && imported.exportName === parsed.exportName;
}
// ============================================================================
// Babel plugins
// ============================================================================
/**
 * Collect all imports: localName -> { importPath, exportName }
 */
function collectImportsPlugin(state) {
    return {
        visitor: {
            ImportDeclaration(path) {
                const importPath = path.node.source.value;
                for (const specifier of path.node.specifiers) {
                    let exportName;
                    if (t.isImportSpecifier(specifier) && t.isIdentifier(specifier.imported)) {
                        exportName = specifier.imported.name;
                    }
                    else if (t.isImportDefaultSpecifier(specifier)) {
                        exportName = 'default';
                    }
                    else {
                        continue;
                    }
                    state.imports.set(specifier.local.name, { importPath, exportName });
                }
            },
        },
    };
}
/**
 * Apply replacement rules to matching call expressions
 */
function applyRulesPlugin(state, rules) {
    return {
        visitor: {
            CallExpression(path) {
                const calleeName = getCalleeName(path.node.callee);
                if (!calleeName)
                    return;
                for (const rule of rules) {
                    if (!matchesRule(path, rule, calleeName, state))
                        continue;
                    if (rule.replace) {
                        applyReplace(path, rule.replace, state);
                    }
                    else if (rule.remove) {
                        applyRemove(path, rule.remove, state);
                    }
                }
            },
        },
    };
}
/**
 * Check if a call expression matches a rule
 */
function matchesRule(path, staticReplace, calleeName, state) {
    const { match } = staticReplace;
    // Check callee name
    const functions = Array.isArray(match.function) ? match.function : [match.function];
    if (!matchesCallee(path.node.callee, calleeName, functions, state))
        return false;
    // Check argument conditions
    if (match.args) {
        for (const [indexStr, condition] of Object.entries(match.args)) {
            const index = Number(indexStr);
            const arg = path.node.arguments[index];
            if (!arg)
                return false;
            if (!matchesCondition(arg, condition, state))
                return false;
        }
    }
    return true;
}
/**
 * Check if callee matches any of the function patterns
 */
function matchesCallee(callee, calleeName, functions, state) {
    for (const fn of functions) {
        const parsed = parseImportString(fn);
        if (parsed) {
            // Import string: check if callee is an imported identifier
            if (t.isIdentifier(callee)) {
                const imported = state.imports.get(callee.name);
                if (imported && imported.importPath === parsed.importPath && imported.exportName === parsed.exportName) {
                    return true;
                }
            }
            // Import string: check member expression
            if (t.isMemberExpression(callee) && t.isIdentifier(callee.object) && t.isIdentifier(callee.property)) {
                const imported = state.imports.get(callee.object.name);
                if (imported &&
                    imported.importPath === parsed.importPath &&
                    imported.exportName === 'default' &&
                    callee.property.name === parsed.exportName) {
                    return true;
                }
            }
        }
        else {
            // Plain string: match function name directly
            if (calleeName === fn)
                return true;
        }
    }
    return false;
}
/**
 * Check if an argument matches a condition
 */
function matchesCondition(arg, condition, state) {
    // String condition
    if (typeof condition === 'string') {
        // Import condition: 'import:importPath:exportName'
        const parsed = parseImportString(condition);
        if (parsed) {
            return t.isExpression(arg) && matchesImport(arg, parsed, state);
        }
        // Plain string: match string literal or identifier name
        if (t.isStringLiteral(arg))
            return arg.value === condition;
        if (t.isIdentifier(arg))
            return arg.name === condition;
        return false;
    }
    // Call expression condition: match call with specific arguments
    if ('call' in condition) {
        if (!t.isCallExpression(arg))
            return false;
        const calleeName = getCalleeName(arg.callee);
        if (!calleeName)
            return false;
        // Check if callee matches
        const parsed = parseImportString(condition.call);
        if (parsed) {
            // Import string: check if callee is an imported identifier
            if (!t.isIdentifier(arg.callee))
                return false;
            const imported = state.imports.get(arg.callee.name);
            if (!imported || imported.importPath !== parsed.importPath || imported.exportName !== parsed.exportName) {
                return false;
            }
        }
        else {
            // Plain string: match function name directly
            if (calleeName !== condition.call)
                return false;
        }
        // Check argument conditions
        if (condition.args) {
            for (const [indexStr, argCondition] of Object.entries(condition.args)) {
                const index = Number(indexStr);
                const nestedArg = arg.arguments[index];
                if (!nestedArg)
                    return false;
                if (!matchesCondition(nestedArg, argCondition, state))
                    return false;
            }
        }
        return true;
    }
    // Member expression condition: match $setup["ClientOnly"]
    if ('member' in condition) {
        if (!t.isMemberExpression(arg))
            return false;
        // Check object
        if (!t.isIdentifier(arg.object) || arg.object.name !== condition.object)
            return false;
        // Check property
        if (typeof condition.property === 'string') {
            // Simple string property
            if (t.isIdentifier(arg.property) && !arg.computed) {
                return arg.property.name === condition.property;
            }
            if (t.isStringLiteral(arg.property) && arg.computed) {
                return arg.property.value === condition.property;
            }
            return false;
        }
        else {
            // Nested condition on property (for future extensibility)
            return false;
        }
    }
    // Object condition: match prop value inside an object argument
    if (!t.isObjectExpression(arg))
        return false;
    for (const prop of arg.properties) {
        if (!t.isObjectProperty(prop))
            continue;
        if (!t.isIdentifier(prop.key) || prop.key.name !== condition.prop)
            continue;
        // Check value
        if (condition.equals === null && t.isNullLiteral(prop.value))
            return true;
        if (condition.equals === true && t.isBooleanLiteral(prop.value) && prop.value.value === true)
            return true;
        if (condition.equals === false && t.isBooleanLiteral(prop.value) && prop.value.value === false)
            return true;
        if (typeof condition.equals === 'string' && t.isStringLiteral(prop.value) && prop.value.value === condition.equals)
            return true;
        if (typeof condition.equals === 'number' && t.isNumericLiteral(prop.value) && prop.value.value === condition.equals)
            return true;
    }
    return false;
}
/**
 * Apply a replacement to a call expression
 */
function applyReplace(path, replace, state) {
    // Replace the entire call expression
    if (!('arg' in replace) && !('argsFrom' in replace)) {
        path.replaceWith(valueToAst(replace.with));
        state.modified = true;
        return;
    }
    // Replace a prop inside an object argument
    if ('arg' in replace && 'prop' in replace) {
        const arg = path.node.arguments[replace.arg];
        if (!t.isObjectExpression(arg))
            return;
        for (const prop of arg.properties) {
            if (!t.isObjectProperty(prop))
                continue;
            if (!t.isIdentifier(prop.key) || prop.key.name !== replace.prop)
                continue;
            prop.value = valueToAst(replace.with);
            state.modified = true;
            return;
        }
    }
    // Replace entire argument
    else if ('arg' in replace) {
        if (path.node.arguments.length > replace.arg) {
            path.node.arguments[replace.arg] = valueToAst(replace.with);
            state.modified = true;
        }
    }
    // Replace all args from index onwards with a single value
    else if ('argsFrom' in replace) {
        if (path.node.arguments.length > replace.argsFrom) {
            path.node.arguments = [...path.node.arguments.slice(0, replace.argsFrom), valueToAst(replace.with)];
            state.modified = true;
        }
    }
}
/**
 * Apply a removal to a call expression
 */
function applyRemove(path, remove, state) {
    // Remove a prop inside an object argument
    if ('prop' in remove) {
        const arg = path.node.arguments[remove.arg];
        if (!t.isObjectExpression(arg))
            return;
        const index = arg.properties.findIndex((prop) => {
            // Check ObjectProperty with Identifier key
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === remove.prop) {
                return true;
            }
            // Check ObjectMethod (getter/setter)
            if (t.isObjectMethod(prop) && t.isIdentifier(prop.key) && prop.key.name === remove.prop) {
                return true;
            }
            return false;
        });
        if (index !== -1) {
            arg.properties.splice(index, 1);
            state.modified = true;
        }
    }
    // Remove entire argument
    else if ('arg' in remove) {
        if (path.node.arguments.length > remove.arg) {
            path.node.arguments.splice(remove.arg, 1);
            state.modified = true;
        }
    }
    // Remove all args from index onwards
    else if ('argsFrom' in remove) {
        if (path.node.arguments.length > remove.argsFrom) {
            path.node.arguments = path.node.arguments.slice(0, remove.argsFrom);
            state.modified = true;
        }
    }
}
/**
 * Remove unreferenced bindings after modifications
 */
function removeUnreferencedPlugin(state) {
    return {
        visitor: {
            Program: {
                enter(program) {
                    for (const [name, binding] of Object.entries(program.scope.bindings)) {
                        if (!binding.referenced)
                            state.alreadyUnreferenced.add(name);
                    }
                },
                exit(program) {
                    if (!state.modified)
                        return;
                    removeUnreferenced(program, state.alreadyUnreferenced);
                },
            },
        },
    };
}
function removeUnreferenced(program, alreadyUnreferenced) {
    for (;;) {
        program.scope.crawl();
        let removed = false;
        for (const [name, binding] of Object.entries(program.scope.bindings)) {
            if (binding.referenced || alreadyUnreferenced.has(name))
                continue;
            const parent = binding.path.parentPath;
            if (parent?.isImportDeclaration() && parent.node.specifiers.length === 1) {
                parent.remove();
            }
            else {
                binding.path.remove();
            }
            removed = true;
        }
        if (!removed)
            break;
    }
}
