'use strict';

// src/normalize-span.ts
var normalizeSpan = (spans, len) => {
  const result = [];
  const append = (start, end, match) => {
    if (end - start > 0) result.push({ start, end, match });
  };
  if (spans.length === 0) {
    append(0, len, false);
  } else {
    let lastIndex = 0;
    for (const chunk of spans) {
      append(lastIndex, chunk.start, false);
      append(chunk.start, chunk.end, true);
      lastIndex = chunk.end;
    }
    append(lastIndex, len, false);
  }
  return result;
};

// src/escape-regex.ts
var escapeRegex = (term) => term.replace(/[|\\{}()[\]^$+*?.-]/g, (char) => `\\${char}`);

// src/highlight-first.ts
function highlightFirst(props) {
  const { text, query, ignoreCase, exactMatch } = props;
  if (exactMatch) {
    const escapedQuery = escapeRegex(query);
    const regex = new RegExp(`\\b(${escapedQuery})\\b`, ignoreCase ? "i" : "");
    const match = text.match(regex);
    if (!match || match.index === void 0) {
      return [{ text, match: false }];
    }
    const start2 = match.index;
    const end2 = start2 + match[0].length;
    const spans2 = [{ start: start2, end: end2 }];
    return normalizeSpan(spans2, text.length).map((chunk) => ({
      text: text.slice(chunk.start, chunk.end),
      match: !!chunk.match
    }));
  }
  const searchText = ignoreCase ? text.toLowerCase() : text;
  const searchQuery = ignoreCase ? typeof query === "string" ? query.toLowerCase() : query : query;
  const start = typeof searchText === "string" ? searchText.indexOf(searchQuery) : -1;
  if (start === -1) {
    return [{ text, match: false }];
  }
  const end = start + searchQuery.length;
  const spans = [{ start, end }];
  return normalizeSpan(spans, text.length).map((chunk) => ({
    text: text.slice(chunk.start, chunk.end),
    match: !!chunk.match
  }));
}

// src/highlight-multiple.ts
var buildRegex = (queryProp, flags, exactMatch) => {
  const query = queryProp.filter(Boolean).map((text) => escapeRegex(text));
  const pattern = exactMatch ? `\\b(${query.join("|")})\\b` : `(${query.join("|")})`;
  return new RegExp(pattern, flags);
};
var getRegexFlags = (ignoreCase, matchAll = true) => `${ignoreCase ? "i" : ""}${matchAll ? "g" : ""}`;
function highlightMultiple(props) {
  const { text, query, ignoreCase, matchAll, exactMatch } = props;
  if (query.length === 0) {
    return [{ text, match: false }];
  }
  const flags = getRegexFlags(ignoreCase, matchAll);
  const regex = buildRegex(Array.isArray(query) ? query : [query], flags, exactMatch);
  const spans = [...text.matchAll(regex)].map((match) => ({
    start: match.index || 0,
    end: (match.index || 0) + match[0].length
  }));
  return normalizeSpan(spans, props.text.length).map((chunk) => ({
    text: props.text.slice(chunk.start, chunk.end),
    match: !!chunk.match
  }));
}

// src/highlight.ts
var highlightWord = (props) => {
  if (props.matchAll == null) {
    props.matchAll = Array.isArray(props.query);
  }
  if (!props.matchAll && Array.isArray(props.query)) {
    throw new Error("matchAll must be true when using multiple queries");
  }
  return props.matchAll ? highlightMultiple(props) : highlightFirst(props);
};

exports.highlightWord = highlightWord;
