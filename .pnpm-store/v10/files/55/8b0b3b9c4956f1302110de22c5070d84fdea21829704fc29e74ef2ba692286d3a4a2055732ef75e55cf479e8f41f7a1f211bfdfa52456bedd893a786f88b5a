"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
function simpleHash(value) {
  if (value === null) return "null";
  if (value === void 0) return "undefined";
  const type = typeof value;
  if (type === "string") return `s:${value}`;
  if (type === "number") return `n:${value}`;
  if (type === "boolean") return `b:${value}`;
  if (type === "function") return `f:${value.name || "anonymous"}`;
  if (Array.isArray(value)) {
    return `a:[${value.map(simpleHash).join(",")}]`;
  }
  if (type === "object") {
    const keys = Object.keys(value).sort();
    return `o:{${keys.map((k) => `${k}:${simpleHash(value[k])}`).join(",")}}`;
  }
  return String(value);
}
class LRUCache {
  constructor(maxSize = 500) {
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    __publicField(this, "maxSize");
    this.maxSize = maxSize;
  }
  get(key) {
    const value = this.cache.get(key);
    if (value !== void 0) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== void 0) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
  clear() {
    this.cache.clear();
  }
}
const memo = (fn) => {
  const cache = new LRUCache();
  function get(...args) {
    const key = args.length === 1 ? simpleHash(args[0]) : args.map(simpleHash).join("|");
    let result = cache.get(key);
    if (result === void 0) {
      result = fn.apply(this, args);
      cache.set(key, result);
    }
    return result;
  }
  return get;
};

export { memo };
