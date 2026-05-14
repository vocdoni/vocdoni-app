'use strict';

var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);

// src/array.ts
function toArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}
var fromLength = (length) => Array.from(Array(length).keys());
var first = (v) => v[0];
var last = (v) => v[v.length - 1];
var isEmpty = (v) => v.length === 0;
var has = (v, t) => v.indexOf(t) !== -1;
var add = (v, ...items) => v.concat(items);
var remove = (v, ...items) => v.filter((t) => !items.includes(t));
var removeAt = (v, i) => v.filter((_, idx) => idx !== i);
var insertAt = (v, i, ...items) => [...v.slice(0, i), ...items, ...v.slice(i)];
var uniq = (v) => Array.from(new Set(v));
var diff = (a, b) => {
  const set = new Set(b);
  return a.filter((t) => !set.has(t));
};
var addOrRemove = (v, item) => has(v, item) ? remove(v, item) : add(v, item);
function clear(v) {
  while (v.length > 0) v.pop();
  return v;
}
function nextIndex(v, idx, opts = {}) {
  const { step = 1, loop = true } = opts;
  const next2 = idx + step;
  const len = v.length;
  const last2 = len - 1;
  if (idx === -1) return step > 0 ? 0 : last2;
  if (next2 < 0) return loop ? last2 : 0;
  if (next2 >= len) return loop ? 0 : idx > len ? len : idx;
  return next2;
}
function next(v, idx, opts = {}) {
  return v[nextIndex(v, idx, opts)];
}
function prevIndex(v, idx, opts = {}) {
  const { step = 1, loop = true } = opts;
  return nextIndex(v, idx, { step: -step, loop });
}
function prev(v, index, opts = {}) {
  return v[prevIndex(v, index, opts)];
}
function chunk(v, size) {
  return v.reduce((rows, value, index) => {
    if (index % size === 0) rows.push([value]);
    else last(rows)?.push(value);
    return rows;
  }, []);
}
function flatArray(arr) {
  return arr.reduce((flat, item) => {
    if (Array.isArray(item)) {
      return flat.concat(flatArray(item));
    }
    return flat.concat(item);
  }, []);
}
function partition(arr, fn) {
  return arr.reduce(
    ([pass, fail], value) => {
      if (fn(value)) pass.push(value);
      else fail.push(value);
      return [pass, fail];
    },
    [[], []]
  );
}

// src/equal.ts
var isArrayLike = (value) => value?.constructor.name === "Array";
var isArrayEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!isEqual(a[i], b[i])) return false;
  }
  return true;
};
var isEqual = (a, b) => {
  if (Object.is(a, b)) return true;
  if (a == null && b != null || a != null && b == null) return false;
  if (typeof a?.isEqual === "function" && typeof b?.isEqual === "function") {
    return a.isEqual(b);
  }
  if (typeof a === "function" && typeof b === "function") {
    return a.toString() === b.toString();
  }
  if (isArrayLike(a) && isArrayLike(b)) {
    return isArrayEqual(Array.from(a), Array.from(b));
  }
  if (!(typeof a === "object") || !(typeof b === "object")) return false;
  const keys = Object.keys(b ?? /* @__PURE__ */ Object.create(null));
  const length = keys.length;
  for (let i = 0; i < length; i++) {
    const hasKey = Reflect.has(a, keys[i]);
    if (!hasKey) return false;
  }
  for (let i = 0; i < length; i++) {
    const key = keys[i];
    if (!isEqual(a[key], b[key])) return false;
  }
  return true;
};

// src/guard.ts
var isDev = () => process.env.NODE_ENV !== "production";
var isArray = (v) => Array.isArray(v);
var isBoolean = (v) => v === true || v === false;
var isObjectLike = (v) => v != null && typeof v === "object";
var isObject = (v) => isObjectLike(v) && !isArray(v);
var isNumber = (v) => typeof v === "number" && !Number.isNaN(v);
var isString = (v) => typeof v === "string";
var isFunction = (v) => typeof v === "function";
var isNull = (v) => v == null;
var hasProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
var baseGetTag = (v) => Object.prototype.toString.call(v);
var fnToString = Function.prototype.toString;
var objectCtorString = fnToString.call(Object);
var isPlainObject = (v) => {
  if (!isObjectLike(v) || baseGetTag(v) != "[object Object]" || isFrameworkElement(v)) return false;
  const proto = Object.getPrototypeOf(v);
  if (proto === null) return true;
  const Ctor = hasProp(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && fnToString.call(Ctor) == objectCtorString;
};
var isReactElement = (x) => typeof x === "object" && x !== null && "$$typeof" in x && "props" in x;
var isVueElement = (x) => typeof x === "object" && x !== null && "__v_isVNode" in x;
var isFrameworkElement = (x) => isReactElement(x) || isVueElement(x);

// src/functions.ts
var runIfFn = (v, ...a) => {
  const res = typeof v === "function" ? v(...a) : v;
  return res ?? void 0;
};
var cast = (v) => v;
var identity = (v) => v();
var noop = () => {
};
var callAll = (...fns) => (...a) => {
  fns.forEach(function(fn) {
    fn?.(...a);
  });
};
var uuid = /* @__PURE__ */ (() => {
  let id = 0;
  return () => {
    id++;
    return id.toString(36);
  };
})();
function match(key, record, ...args) {
  if (key in record) {
    const fn = record[key];
    return isFunction(fn) ? fn(...args) : fn;
  }
  const error = new Error(`No matching key: ${JSON.stringify(key)} in ${JSON.stringify(Object.keys(record))}`);
  Error.captureStackTrace?.(error, match);
  throw error;
}
var tryCatch = (fn, fallback) => {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      Error.captureStackTrace?.(error, tryCatch);
    }
    return fallback?.();
  }
};
function throttle(fn, wait = 0) {
  let lastCall = 0;
  let timeout = null;
  return ((...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    if (timeSinceLastCall >= wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      fn(...args);
      lastCall = now;
    } else if (!timeout) {
      timeout = setTimeout(() => {
        fn(...args);
        lastCall = Date.now();
        timeout = null;
      }, wait - timeSinceLastCall);
    }
  });
}
function debounce(fn, wait = 0) {
  let timeout = null;
  return ((...args) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  });
}

// src/number.ts
var { floor, abs, round, min, max, pow, sign } = Math;
var isNaN = (v) => Number.isNaN(v);
var nan = (v) => isNaN(v) ? 0 : v;
var mod = (v, m) => (v % m + m) % m;
var wrap = (v, vmax) => (v % vmax + vmax) % vmax;
var getMinValueAtIndex = (i, v, vmin) => i === 0 ? vmin : v[i - 1];
var getMaxValueAtIndex = (i, v, vmax) => i === v.length - 1 ? vmax : v[i + 1];
var isValueAtMax = (v, vmax) => nan(v) >= vmax;
var isValueAtMin = (v, vmin) => nan(v) <= vmin;
var isValueWithinRange = (v, vmin, vmax) => {
  const value = nan(v);
  const minCheck = vmin == null || value >= vmin;
  const maxCheck = vmax == null || value <= vmax;
  return minCheck && maxCheck;
};
var roundValue = (v, vmin, step) => round((nan(v) - vmin) / step) * step + vmin;
var clampValue = (v, vmin, vmax) => min(max(nan(v), vmin), vmax);
var clampPercent = (v) => clampValue(v, 0, 1);
var getValuePercent = (v, vmin, vmax) => (nan(v) - vmin) / (vmax - vmin);
var getPercentValue = (p, vmin, vmax, step) => clampValue(roundValue(p * (vmax - vmin) + vmin, vmin, step), vmin, vmax);
var roundToStepPrecision = (v, step) => {
  let rv = v;
  let ss = step.toString();
  let pi = ss.indexOf(".");
  let p = pi >= 0 ? ss.length - pi : 0;
  if (p > 0) {
    let pw = pow(10, p);
    rv = round(rv * pw) / pw;
  }
  return rv;
};
var roundToDpr = (v, dpr) => typeof dpr === "number" ? floor(v * dpr + 0.5) / dpr : round(v);
var snapValueToStep = (v, vmin, vmax, step) => {
  const min2 = vmin != null ? Number(vmin) : 0;
  const max2 = Number(vmax);
  const remainder = (v - min2) % step;
  let snapped = abs(remainder) * 2 >= step ? v + sign(remainder) * (step - abs(remainder)) : v - remainder;
  snapped = roundToStepPrecision(snapped, step);
  if (!isNaN(min2) && snapped < min2) {
    snapped = min2;
  } else if (!isNaN(max2) && snapped > max2) {
    const stepsInRange = floor((max2 - min2) / step);
    const largestValidStep = min2 + stepsInRange * step;
    snapped = stepsInRange <= 0 || largestValidStep < min2 ? max2 : largestValidStep;
  }
  return roundToStepPrecision(snapped, step);
};
var setValueAtIndex = (vs, i, v) => {
  if (vs[i] === v) return vs;
  return [...vs.slice(0, i), v, ...vs.slice(i + 1)];
};
function getValueSetterAtIndex(index, ctx) {
  const minValueAtIndex = getMinValueAtIndex(index, ctx.values, ctx.min);
  const maxValueAtIndex = getMaxValueAtIndex(index, ctx.values, ctx.max);
  let nextValues = ctx.values.slice();
  return function setValue(value) {
    let nextValue = snapValueToStep(value, minValueAtIndex, maxValueAtIndex, ctx.step);
    nextValues = setValueAtIndex(nextValues, index, value);
    nextValues[index] = nextValue;
    return nextValues;
  };
}
function getNextStepValue(index, ctx) {
  const nextValue = ctx.values[index] + ctx.step;
  return getValueSetterAtIndex(index, ctx)(nextValue);
}
function getPreviousStepValue(index, ctx) {
  const nextValue = ctx.values[index] - ctx.step;
  return getValueSetterAtIndex(index, ctx)(nextValue);
}
var getClosestValueIndex = (vs, t) => {
  let i = vs.findIndex((v) => t - v < 0);
  if (i === 0) return i;
  if (i === -1) return vs.length - 1;
  let vLeft = vs[i - 1];
  let vRight = vs[i];
  if (abs(vLeft - t) < abs(vRight - t)) return i - 1;
  return i;
};
var getClosestValue = (vs, t) => vs[getClosestValueIndex(vs, t)];
var getValueRanges = (vs, vmin, vmax, gap) => vs.map((v, i) => ({
  min: i === 0 ? vmin : vs[i - 1] + gap,
  max: i === vs.length - 1 ? vmax : vs[i + 1] - gap,
  value: v
}));
var getValueTransformer = (va, vb) => {
  const [a, b] = va;
  const [c, d] = vb;
  return (v) => a === b || c === d ? c : c + (d - c) / (b - a) * (v - a);
};
var toFixedNumber = (v, d = 0, b = 10) => {
  const pow2 = Math.pow(b, d);
  return round(v * pow2) / pow2;
};
var countDecimals = (value) => {
  if (!Number.isFinite(value)) return 0;
  let e = 1, p = 0;
  while (Math.round(value * e) / e !== value) {
    e *= 10;
    p += 1;
  }
  return p;
};
var decimalOp = (a, op, b) => {
  let result = op === "+" ? a + b : a - b;
  if (a % 1 !== 0 || b % 1 !== 0) {
    const multiplier = 10 ** Math.max(countDecimals(a), countDecimals(b));
    a = Math.round(a * multiplier);
    b = Math.round(b * multiplier);
    result = op === "+" ? a + b : a - b;
    result /= multiplier;
  }
  return result;
};
var incrementValue = (v, s) => decimalOp(nan(v), "+", s);
var decrementValue = (v, s) => decimalOp(nan(v), "-", s);
var toPx = (v) => typeof v === "number" ? `${v}px` : v;

// src/object.ts
function compact(obj) {
  if (!isPlainObject(obj) || obj === void 0) return obj;
  const keys = Reflect.ownKeys(obj).filter((key) => typeof key === "string");
  const filtered = {};
  for (const key of keys) {
    const value = obj[key];
    if (value !== void 0) {
      filtered[key] = compact(value);
    }
  }
  return filtered;
}
var json = (v) => JSON.parse(JSON.stringify(v));
function pick(obj, keys) {
  const filtered = {};
  for (const key of keys) {
    const value = obj[key];
    if (value !== void 0) {
      filtered[key] = value;
    }
  }
  return filtered;
}
function splitProps(props, keys) {
  const rest = {};
  const result = {};
  const keySet = new Set(keys);
  const ownKeys = Reflect.ownKeys(props);
  for (const key of ownKeys) {
    if (keySet.has(key)) {
      result[key] = props[key];
    } else {
      rest[key] = props[key];
    }
  }
  return [result, rest];
}
var createSplitProps = (keys) => {
  return function split(props) {
    return splitProps(props, keys);
  };
};
function omit(obj, keys) {
  return createSplitProps(keys)(obj)[1];
}

// src/store.ts
function createStore(initialState, compare = Object.is) {
  let state = { ...initialState };
  const listeners = /* @__PURE__ */ new Set();
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const publish = () => {
    listeners.forEach((listener) => listener());
  };
  const get = (key) => {
    return state[key];
  };
  const set = (key, value) => {
    if (!compare(state[key], value)) {
      state[key] = value;
      publish();
    }
  };
  const update = (updates) => {
    let hasChanges = false;
    for (const key in updates) {
      const value = updates[key];
      if (value !== void 0 && !compare(state[key], value)) {
        state[key] = value;
        hasChanges = true;
      }
    }
    if (hasChanges) {
      publish();
    }
  };
  const snapshot = () => ({ ...state });
  return {
    subscribe,
    get,
    set,
    update,
    snapshot
  };
}

// src/timers.ts
var currentTime = () => performance.now();
var _tick;
var Timer = class {
  constructor(onTick) {
    this.onTick = onTick;
    __publicField(this, "frameId", null);
    __publicField(this, "pausedAtMs", null);
    __publicField(this, "context");
    __publicField(this, "cancelFrame", () => {
      if (this.frameId === null) return;
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    });
    __publicField(this, "setStartMs", (startMs) => {
      this.context.startMs = startMs;
    });
    __publicField(this, "start", () => {
      if (this.frameId !== null) return;
      const now = currentTime();
      if (this.pausedAtMs !== null) {
        this.context.startMs += now - this.pausedAtMs;
        this.pausedAtMs = null;
      } else {
        this.context.startMs = now;
      }
      this.frameId = requestAnimationFrame(__privateGet(this, _tick));
    });
    __publicField(this, "pause", () => {
      if (this.frameId === null) return;
      this.cancelFrame();
      this.pausedAtMs = currentTime();
    });
    __publicField(this, "stop", () => {
      if (this.frameId === null) return;
      this.cancelFrame();
      this.pausedAtMs = null;
    });
    __privateAdd(this, _tick, (now) => {
      this.context.now = now;
      this.context.deltaMs = now - this.context.startMs;
      const shouldContinue = this.onTick(this.context);
      if (shouldContinue === false) {
        this.stop();
        return;
      }
      this.frameId = requestAnimationFrame(__privateGet(this, _tick));
    });
    this.context = { now: 0, startMs: currentTime(), deltaMs: 0 };
  }
  get elapsedMs() {
    if (this.pausedAtMs !== null) {
      return this.pausedAtMs - this.context.startMs;
    }
    return currentTime() - this.context.startMs;
  }
};
_tick = new WeakMap();
function setRafInterval(fn, intervalMs) {
  const timer = new Timer(({ now, deltaMs }) => {
    if (deltaMs >= intervalMs) {
      const startMs = intervalMs > 0 ? now - deltaMs % intervalMs : now;
      timer.setStartMs(startMs);
      fn({ startMs, deltaMs });
    }
  });
  timer.start();
  return () => timer.stop();
}
function setRafTimeout(fn, delayMs) {
  const timer = new Timer(({ deltaMs }) => {
    if (deltaMs >= delayMs) {
      fn();
      return false;
    }
  });
  timer.start();
  return () => timer.stop();
}

// src/warning.ts
function warn(...a) {
  const m = a.length === 1 ? a[0] : a[1];
  const c = a.length === 2 ? a[0] : true;
  if (c && process.env.NODE_ENV !== "production") {
    console.warn(m);
  }
}
function invariant(...a) {
  const m = a.length === 1 ? a[0] : a[1];
  const c = a.length === 2 ? a[0] : true;
  if (c && process.env.NODE_ENV !== "production") {
    throw new Error(m);
  }
}
function ensure(c, m) {
  if (c == null) throw new Error(m());
}
function ensureProps(props, keys, scope) {
  let missingKeys = [];
  for (const key of keys) {
    if (props[key] == null) missingKeys.push(key);
  }
  if (missingKeys.length > 0)
    throw new Error(`[zag-js${scope ? ` > ${scope}` : ""}] missing required props: ${missingKeys.join(", ")}`);
}

exports.Timer = Timer;
exports.add = add;
exports.addOrRemove = addOrRemove;
exports.callAll = callAll;
exports.cast = cast;
exports.chunk = chunk;
exports.clampPercent = clampPercent;
exports.clampValue = clampValue;
exports.clear = clear;
exports.compact = compact;
exports.createSplitProps = createSplitProps;
exports.createStore = createStore;
exports.debounce = debounce;
exports.decrementValue = decrementValue;
exports.diff = diff;
exports.ensure = ensure;
exports.ensureProps = ensureProps;
exports.first = first;
exports.flatArray = flatArray;
exports.fromLength = fromLength;
exports.getClosestValue = getClosestValue;
exports.getClosestValueIndex = getClosestValueIndex;
exports.getMaxValueAtIndex = getMaxValueAtIndex;
exports.getMinValueAtIndex = getMinValueAtIndex;
exports.getNextStepValue = getNextStepValue;
exports.getPercentValue = getPercentValue;
exports.getPreviousStepValue = getPreviousStepValue;
exports.getValuePercent = getValuePercent;
exports.getValueRanges = getValueRanges;
exports.getValueSetterAtIndex = getValueSetterAtIndex;
exports.getValueTransformer = getValueTransformer;
exports.has = has;
exports.hasProp = hasProp;
exports.identity = identity;
exports.incrementValue = incrementValue;
exports.insertAt = insertAt;
exports.invariant = invariant;
exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isDev = isDev;
exports.isEmpty = isEmpty;
exports.isEqual = isEqual;
exports.isFunction = isFunction;
exports.isNaN = isNaN;
exports.isNull = isNull;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isObjectLike = isObjectLike;
exports.isPlainObject = isPlainObject;
exports.isString = isString;
exports.isValueAtMax = isValueAtMax;
exports.isValueAtMin = isValueAtMin;
exports.isValueWithinRange = isValueWithinRange;
exports.json = json;
exports.last = last;
exports.match = match;
exports.mod = mod;
exports.nan = nan;
exports.next = next;
exports.nextIndex = nextIndex;
exports.noop = noop;
exports.omit = omit;
exports.partition = partition;
exports.pick = pick;
exports.prev = prev;
exports.prevIndex = prevIndex;
exports.remove = remove;
exports.removeAt = removeAt;
exports.roundToDpr = roundToDpr;
exports.roundToStepPrecision = roundToStepPrecision;
exports.roundValue = roundValue;
exports.runIfFn = runIfFn;
exports.setRafInterval = setRafInterval;
exports.setRafTimeout = setRafTimeout;
exports.setValueAtIndex = setValueAtIndex;
exports.snapValueToStep = snapValueToStep;
exports.splitProps = splitProps;
exports.throttle = throttle;
exports.toArray = toArray;
exports.toFixedNumber = toFixedNumber;
exports.toPx = toPx;
exports.tryCatch = tryCatch;
exports.uniq = uniq;
exports.uuid = uuid;
exports.warn = warn;
exports.wrap = wrap;
