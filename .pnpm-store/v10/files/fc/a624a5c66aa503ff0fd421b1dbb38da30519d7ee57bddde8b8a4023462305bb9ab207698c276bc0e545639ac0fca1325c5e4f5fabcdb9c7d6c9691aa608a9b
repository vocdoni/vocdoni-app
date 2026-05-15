(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.i18nextResourcesForTS = {}));
})(this, (function (exports) { 'use strict';

  const defaults = {
    quotes: 'single'
  };

  function trim(arr, startOnly) {
    let start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }
    let end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }
    if (start > end) return [];
    if (startOnly) return arr.slice(start);
    return arr.slice(start, end);
  }
  const pathSeparatorWin = '\\';
  const pathSeparator = '/';
  function relative(from, to) {
    let separatorInFileContent = pathSeparator;
    let separator = pathSeparator;
    const seemsWindowsPath = from.indexOf(pathSeparatorWin) > -1 || to.indexOf(pathSeparatorWin) > -1;
    if (seemsWindowsPath) {
      separator = pathSeparatorWin;
    }
    if (from.endsWith(separator)) from = from.substring(0, from.length - separator.length);
    const toParts = trim(to.split(separator), true);
    const splittedFrom = from.split(separator);
    const lowerFromParts = trim(splittedFrom, from.indexOf('.') < 0);
    const splittedTo = to.split(separator);
    const lowerToParts = trim(splittedTo, true);
    const length = Math.min(lowerFromParts.length, lowerToParts.length);
    let samePartsLength = length;
    for (let i = 0; i < length; i++) {
      if (lowerFromParts[i] !== lowerToParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    if (samePartsLength === 0) return to;
    let outputParts = [];
    for (let i = samePartsLength; i < lowerFromParts.length; i++) {
      outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    if (seemsWindowsPath && outputParts[2] === ':') {
      separatorInFileContent = pathSeparatorWin;
    }
    let ret = outputParts.join(separatorInFileContent);
    if (!ret.startsWith(from.substring(0, 2)) && !ret.startsWith('.')) {
      ret = `.${separatorInFileContent}${ret}`;
    }
    return ret;
  }

  function getVarName(name) {
    if (name.indexOf('-') > 0 || name.indexOf(' ') > 0) {
      return name.replace(/[- ]/g, '');
    }
    return name;
  }
  function tocForResources(namespaces, toPath, options = {}) {
    const opt = {
      ...options,
      ...defaults
    };
    const quoteChar = opt.quotes === 'single' ? '\'' : '"';
    let toc = '';
    namespaces.forEach(ns => {
      const nameToUse = getVarName(ns.name);
      if (ns.tsPath) {
        toc += `import ${nameToUse} from ${quoteChar}${relative(toPath, ns.tsPath.replace('.ts', ''))}${quoteChar};\n`;
      } else {
        toc += `import ${nameToUse} from ${quoteChar}${relative(toPath, ns.path)}${quoteChar};\n`;
      }
    });
    toc += '\nconst resources = {';
    namespaces.forEach((ns, i) => {
      const nameToUse = getVarName(ns.name);
      if (nameToUse !== ns.name) {
        toc += `\n  ${quoteChar}${ns.name}${quoteChar}: ${nameToUse}`;
      } else {
        toc += `\n  ${ns.name}`;
      }
      if (i < namespaces.length - 1) {
        toc += ',';
      }
    });
    toc += '\n} as const;\n';
    toc += '\nexport default resources;\n';
    return toc;
  }

  function mergeResources(namespaces) {
    return namespaces.reduce((prev, cur) => {
      prev[cur.name] = cur.resources;
      return prev;
    }, {});
  }

  function mergeResourcesAsInterface(namespaces, options = {}) {
    let resources = mergeResources(namespaces);
    let interfaceFileContent = 'interface Resources ';
    if (options.optimize) {
      resources = groupPluralKeys(Object.entries(resources), options);
    }
    interfaceFileContent += resourceToString(resources, 0, options);
    interfaceFileContent += '\n\nexport default Resources;\n';
    return interfaceFileContent;
  }
  function resourceToString(resources, depth = 0, opts) {
    const options = {
      ...defaultOptions,
      ...(opts || {})
    };
    const indentUnit = typeof options.indentation === 'number' ? ' '.repeat(options.indentation) : String(options.indentation);
    const indent = indentUnit.repeat(depth);
    if (typeof resources === 'string') return JSON.stringify(resources);
    if (Array.isArray(resources)) {
      return `[${resources.map(it => resourceToString(it, 0, options)).join(', ')}]`;
    }
    if (resources && '_tag' in resources && resources._tag === translationSymbol) {
      return resources.value.map(it => JSON.stringify(it)).join(' | ');
    }
    if (typeof resources === 'object' && resources !== null) {
      const entries = Object.entries(resources).sort(([k1], [k2]) => {
        if (k1 < k2) return -1;
        if (k1 > k2) return 1;
        return 0;
      }).map(([k, v]) => {
        return `"${k.replace(/"/g, '\\"')}": ${resourceToString(v, depth + 1, options)}`;
      });
      const closingIndent = depth > 0 ? indentUnit.repeat(depth - 1) + '  ' : '';
      return `{\n${entries.map(it => `${indent}  ${it}`).join(',\n')}\n${closingIndent}}`;
    }
  }
  const isPluralKey = (key, {
    pluralSeparator = defaultOptions.pluralSeparator
  }) => pluralSuffixes.map(suffix => `${pluralSeparator}${suffix}`).some(suffix => key.endsWith(suffix));
  const defaultOptions = {
    pluralSeparator: '_',
    indentation: 2
  };
  const pluralSuffixes = ['zero', 'one', 'two', 'few', 'many', 'other'];
  const isPluralEntry = options => entry => isPluralKey(entry[0], options);
  function rmPluralization(entry, options) {
    if (!isPluralEntry(options)(entry)) return null;else {
      const [key] = entry;
      const index = key.lastIndexOf(options.pluralSeparator ?? defaultOptions.pluralSeparator);
      return key.slice(0, index);
    }
  }
  const translationSymbol = Symbol('is-translation');
  function groupPluralKeys(entries, options) {
    if (typeof entries === 'string') return entries;
    if (entries.length === 0) return {};
    return entries.reduce((acc, [k, v]) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        acc[k] = groupPluralKeys(Object.entries(v), options);
        return acc;
      }
      if (Array.isArray(v)) {
        acc[k] = v.map(item => {
          if (typeof item === 'object' && item !== null) {
            return groupPluralKeys(Object.entries(item), options);
          }
          return item;
        });
        return acc;
      }
      const maybe = rmPluralization([k, v], options);
      if (maybe == null) {
        acc[k] = {
          _tag: translationSymbol,
          value: [v]
        };
        return acc;
      }
      const depluralized = maybe;
      if (depluralized in acc) {
        const existing = acc[depluralized];
        acc[depluralized] = {
          _tag: translationSymbol,
          value: [...existing.value, v]
        };
        return acc;
      } else {
        acc[depluralized] = {
          _tag: translationSymbol,
          value: [v]
        };
        return acc;
      }
    }, {});
  }

  function json2ts(resources) {
    let tsContent = 'const ns = ';
    tsContent += JSON.stringify(resources, null, 2);
    tsContent += ' as const;\n';
    tsContent += '\nexport default ns;\n';
    return tsContent;
  }

  exports.json2ts = json2ts;
  exports.mergeResources = mergeResources;
  exports.mergeResourcesAsInterface = mergeResourcesAsInterface;
  exports.tocForResources = tocForResources;

}));
