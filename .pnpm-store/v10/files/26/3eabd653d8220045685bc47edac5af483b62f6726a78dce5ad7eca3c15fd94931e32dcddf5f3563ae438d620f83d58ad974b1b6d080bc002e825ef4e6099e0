"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

// node_modules/@protobufjs/aspromise/index.js
var require_aspromise = __commonJS({
  "node_modules/@protobufjs/aspromise/index.js"(exports2, module2) {
    "use strict";
    module2.exports = asPromise;
    function asPromise(fn, ctx) {
      var params = new Array(arguments.length - 1), offset = 0, index = 2, pending = true;
      while (index < arguments.length)
        params[offset++] = arguments[index++];
      return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err) {
          if (pending) {
            pending = false;
            if (err)
              reject(err);
            else {
              var params2 = new Array(arguments.length - 1), offset2 = 0;
              while (offset2 < params2.length)
                params2[offset2++] = arguments[offset2];
              resolve.apply(null, params2);
            }
          }
        };
        try {
          fn.apply(ctx || null, params);
        } catch (err) {
          if (pending) {
            pending = false;
            reject(err);
          }
        }
      });
    }
  }
});

// node_modules/@protobufjs/base64/index.js
var require_base64 = __commonJS({
  "node_modules/@protobufjs/base64/index.js"(exports2) {
    "use strict";
    var base64 = exports2;
    base64.length = function length(string) {
      var p = string.length;
      if (!p)
        return 0;
      var n = 0;
      while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
      return Math.ceil(string.length * 3) / 4 - n;
    };
    var b64 = new Array(64);
    var s64 = new Array(123);
    for (i = 0; i < 64; )
      s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;
    var i;
    base64.encode = function encode(buffer, start, end) {
      var parts = null, chunk = [];
      var i2 = 0, j = 0, t;
      while (start < end) {
        var b = buffer[start++];
        switch (j) {
          case 0:
            chunk[i2++] = b64[b >> 2];
            t = (b & 3) << 4;
            j = 1;
            break;
          case 1:
            chunk[i2++] = b64[t | b >> 4];
            t = (b & 15) << 2;
            j = 2;
            break;
          case 2:
            chunk[i2++] = b64[t | b >> 6];
            chunk[i2++] = b64[b & 63];
            j = 0;
            break;
        }
        if (i2 > 8191) {
          (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
          i2 = 0;
        }
      }
      if (j) {
        chunk[i2++] = b64[t];
        chunk[i2++] = 61;
        if (j === 1)
          chunk[i2++] = 61;
      }
      if (parts) {
        if (i2)
          parts.push(String.fromCharCode.apply(String, chunk.slice(0, i2)));
        return parts.join("");
      }
      return String.fromCharCode.apply(String, chunk.slice(0, i2));
    };
    var invalidEncoding = "invalid encoding";
    base64.decode = function decode(string, buffer, offset) {
      var start = offset;
      var j = 0, t;
      for (var i2 = 0; i2 < string.length; ) {
        var c = string.charCodeAt(i2++);
        if (c === 61 && j > 1)
          break;
        if ((c = s64[c]) === void 0)
          throw Error(invalidEncoding);
        switch (j) {
          case 0:
            t = c;
            j = 1;
            break;
          case 1:
            buffer[offset++] = t << 2 | (c & 48) >> 4;
            t = c;
            j = 2;
            break;
          case 2:
            buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
            t = c;
            j = 3;
            break;
          case 3:
            buffer[offset++] = (t & 3) << 6 | c;
            j = 0;
            break;
        }
      }
      if (j === 1)
        throw Error(invalidEncoding);
      return offset - start;
    };
    base64.test = function test(string) {
      return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
    };
  }
});

// node_modules/@protobufjs/eventemitter/index.js
var require_eventemitter = __commonJS({
  "node_modules/@protobufjs/eventemitter/index.js"(exports2, module2) {
    "use strict";
    module2.exports = EventEmitter;
    function EventEmitter() {
      this._listeners = {};
    }
    EventEmitter.prototype.on = function on(evt, fn, ctx) {
      (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn,
        ctx: ctx || this
      });
      return this;
    };
    EventEmitter.prototype.off = function off(evt, fn) {
      if (evt === void 0)
        this._listeners = {};
      else {
        if (fn === void 0)
          this._listeners[evt] = [];
        else {
          var listeners = this._listeners[evt];
          for (var i = 0; i < listeners.length; )
            if (listeners[i].fn === fn)
              listeners.splice(i, 1);
            else
              ++i;
        }
      }
      return this;
    };
    EventEmitter.prototype.emit = function emit(evt) {
      var listeners = this._listeners[evt];
      if (listeners) {
        var args = [], i = 1;
        for (; i < arguments.length; )
          args.push(arguments[i++]);
        for (i = 0; i < listeners.length; )
          listeners[i].fn.apply(listeners[i++].ctx, args);
      }
      return this;
    };
  }
});

// node_modules/@protobufjs/float/index.js
var require_float = __commonJS({
  "node_modules/@protobufjs/float/index.js"(exports2, module2) {
    "use strict";
    module2.exports = factory(factory);
    function factory(exports3) {
      if (typeof Float32Array !== "undefined")
        (function() {
          var f32 = new Float32Array([-0]), f8b = new Uint8Array(f32.buffer), le = f8b[3] === 128;
          function writeFloat_f32_cpy(val, buf, pos) {
            f32[0] = val;
            buf[pos] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
          }
          function writeFloat_f32_rev(val, buf, pos) {
            f32[0] = val;
            buf[pos] = f8b[3];
            buf[pos + 1] = f8b[2];
            buf[pos + 2] = f8b[1];
            buf[pos + 3] = f8b[0];
          }
          exports3.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
          exports3.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;
          function readFloat_f32_cpy(buf, pos) {
            f8b[0] = buf[pos];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            return f32[0];
          }
          function readFloat_f32_rev(buf, pos) {
            f8b[3] = buf[pos];
            f8b[2] = buf[pos + 1];
            f8b[1] = buf[pos + 2];
            f8b[0] = buf[pos + 3];
            return f32[0];
          }
          exports3.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
          exports3.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;
        })();
      else
        (function() {
          function writeFloat_ieee754(writeUint, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
              val = -val;
            if (val === 0)
              writeUint(1 / val > 0 ? (
                /* positive */
                0
              ) : (
                /* negative 0 */
                2147483648
              ), buf, pos);
            else if (isNaN(val))
              writeUint(2143289344, buf, pos);
            else if (val > 34028234663852886e22)
              writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
            else if (val < 11754943508222875e-54)
              writeUint((sign << 31 | Math.round(val / 1401298464324817e-60)) >>> 0, buf, pos);
            else {
              var exponent = Math.floor(Math.log(val) / Math.LN2), mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
              writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
            }
          }
          exports3.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
          exports3.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);
          function readFloat_ieee754(readUint, buf, pos) {
            var uint = readUint(buf, pos), sign = (uint >> 31) * 2 + 1, exponent = uint >>> 23 & 255, mantissa = uint & 8388607;
            return exponent === 255 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 1401298464324817e-60 * mantissa : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
          }
          exports3.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
          exports3.readFloatBE = readFloat_ieee754.bind(null, readUintBE);
        })();
      if (typeof Float64Array !== "undefined")
        (function() {
          var f64 = new Float64Array([-0]), f8b = new Uint8Array(f64.buffer), le = f8b[7] === 128;
          function writeDouble_f64_cpy(val, buf, pos) {
            f64[0] = val;
            buf[pos] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
            buf[pos + 4] = f8b[4];
            buf[pos + 5] = f8b[5];
            buf[pos + 6] = f8b[6];
            buf[pos + 7] = f8b[7];
          }
          function writeDouble_f64_rev(val, buf, pos) {
            f64[0] = val;
            buf[pos] = f8b[7];
            buf[pos + 1] = f8b[6];
            buf[pos + 2] = f8b[5];
            buf[pos + 3] = f8b[4];
            buf[pos + 4] = f8b[3];
            buf[pos + 5] = f8b[2];
            buf[pos + 6] = f8b[1];
            buf[pos + 7] = f8b[0];
          }
          exports3.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
          exports3.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;
          function readDouble_f64_cpy(buf, pos) {
            f8b[0] = buf[pos];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            f8b[4] = buf[pos + 4];
            f8b[5] = buf[pos + 5];
            f8b[6] = buf[pos + 6];
            f8b[7] = buf[pos + 7];
            return f64[0];
          }
          function readDouble_f64_rev(buf, pos) {
            f8b[7] = buf[pos];
            f8b[6] = buf[pos + 1];
            f8b[5] = buf[pos + 2];
            f8b[4] = buf[pos + 3];
            f8b[3] = buf[pos + 4];
            f8b[2] = buf[pos + 5];
            f8b[1] = buf[pos + 6];
            f8b[0] = buf[pos + 7];
            return f64[0];
          }
          exports3.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
          exports3.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;
        })();
      else
        (function() {
          function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
              val = -val;
            if (val === 0) {
              writeUint(0, buf, pos + off0);
              writeUint(1 / val > 0 ? (
                /* positive */
                0
              ) : (
                /* negative 0 */
                2147483648
              ), buf, pos + off1);
            } else if (isNaN(val)) {
              writeUint(0, buf, pos + off0);
              writeUint(2146959360, buf, pos + off1);
            } else if (val > 17976931348623157e292) {
              writeUint(0, buf, pos + off0);
              writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
            } else {
              var mantissa;
              if (val < 22250738585072014e-324) {
                mantissa = val / 5e-324;
                writeUint(mantissa >>> 0, buf, pos + off0);
                writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
              } else {
                var exponent = Math.floor(Math.log(val) / Math.LN2);
                if (exponent === 1024)
                  exponent = 1023;
                mantissa = val * Math.pow(2, -exponent);
                writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
                writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
              }
            }
          }
          exports3.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
          exports3.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);
          function readDouble_ieee754(readUint, off0, off1, buf, pos) {
            var lo = readUint(buf, pos + off0), hi = readUint(buf, pos + off1);
            var sign = (hi >> 31) * 2 + 1, exponent = hi >>> 20 & 2047, mantissa = 4294967296 * (hi & 1048575) + lo;
            return exponent === 2047 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 5e-324 * mantissa : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
          }
          exports3.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
          exports3.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);
        })();
      return exports3;
    }
    function writeUintLE(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    function writeUintBE(val, buf, pos) {
      buf[pos] = val >>> 24;
      buf[pos + 1] = val >>> 16 & 255;
      buf[pos + 2] = val >>> 8 & 255;
      buf[pos + 3] = val & 255;
    }
    function readUintLE(buf, pos) {
      return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16 | buf[pos + 3] << 24) >>> 0;
    }
    function readUintBE(buf, pos) {
      return (buf[pos] << 24 | buf[pos + 1] << 16 | buf[pos + 2] << 8 | buf[pos + 3]) >>> 0;
    }
  }
});

// node_modules/@protobufjs/inquire/index.js
var require_inquire = __commonJS({
  "node_modules/@protobufjs/inquire/index.js"(exports, module) {
    "use strict";
    module.exports = inquire;
    function inquire(moduleName) {
      try {
        var mod = eval("quire".replace(/^/, "re"))(moduleName);
        if (mod && (mod.length || Object.keys(mod).length))
          return mod;
      } catch (e) {
      }
      return null;
    }
  }
});

// node_modules/@protobufjs/utf8/index.js
var require_utf8 = __commonJS({
  "node_modules/@protobufjs/utf8/index.js"(exports2) {
    "use strict";
    var utf8 = exports2;
    utf8.length = function utf8_length(string) {
      var len = 0, c = 0;
      for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
          len += 1;
        else if (c < 2048)
          len += 2;
        else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
          ++i;
          len += 4;
        } else
          len += 3;
      }
      return len;
    };
    utf8.read = function utf8_read(buffer, start, end) {
      var len = end - start;
      if (len < 1)
        return "";
      var parts = null, chunk = [], i = 0, t;
      while (start < end) {
        t = buffer[start++];
        if (t < 128)
          chunk[i++] = t;
        else if (t > 191 && t < 224)
          chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
        else if (t > 239 && t < 365) {
          t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 65536;
          chunk[i++] = 55296 + (t >> 10);
          chunk[i++] = 56320 + (t & 1023);
        } else
          chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
        if (i > 8191) {
          (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
          i = 0;
        }
      }
      if (parts) {
        if (i)
          parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
      }
      return String.fromCharCode.apply(String, chunk.slice(0, i));
    };
    utf8.write = function utf8_write(string, buffer, offset) {
      var start = offset, c1, c2;
      for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
          buffer[offset++] = c1;
        } else if (c1 < 2048) {
          buffer[offset++] = c1 >> 6 | 192;
          buffer[offset++] = c1 & 63 | 128;
        } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
          c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
          ++i;
          buffer[offset++] = c1 >> 18 | 240;
          buffer[offset++] = c1 >> 12 & 63 | 128;
          buffer[offset++] = c1 >> 6 & 63 | 128;
          buffer[offset++] = c1 & 63 | 128;
        } else {
          buffer[offset++] = c1 >> 12 | 224;
          buffer[offset++] = c1 >> 6 & 63 | 128;
          buffer[offset++] = c1 & 63 | 128;
        }
      }
      return offset - start;
    };
  }
});

// node_modules/@protobufjs/pool/index.js
var require_pool = __commonJS({
  "node_modules/@protobufjs/pool/index.js"(exports2, module2) {
    "use strict";
    module2.exports = pool;
    function pool(alloc, slice, size) {
      var SIZE = size || 8192;
      var MAX = SIZE >>> 1;
      var slab = null;
      var offset = SIZE;
      return function pool_alloc(size2) {
        if (size2 < 1 || size2 > MAX)
          return alloc(size2);
        if (offset + size2 > SIZE) {
          slab = alloc(SIZE);
          offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size2);
        if (offset & 7)
          offset = (offset | 7) + 1;
        return buf;
      };
    }
  }
});

// node_modules/protobufjs/src/util/longbits.js
var require_longbits = __commonJS({
  "node_modules/protobufjs/src/util/longbits.js"(exports2, module2) {
    "use strict";
    module2.exports = LongBits;
    var util = require_minimal();
    function LongBits(lo, hi) {
      this.lo = lo >>> 0;
      this.hi = hi >>> 0;
    }
    var zero = LongBits.zero = new LongBits(0, 0);
    zero.toNumber = function() {
      return 0;
    };
    zero.zzEncode = zero.zzDecode = function() {
      return this;
    };
    zero.length = function() {
      return 1;
    };
    var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";
    LongBits.fromNumber = function fromNumber(value) {
      if (value === 0)
        return zero;
      var sign = value < 0;
      if (sign)
        value = -value;
      var lo = value >>> 0, hi = (value - lo) / 4294967296 >>> 0;
      if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
          lo = 0;
          if (++hi > 4294967295)
            hi = 0;
        }
      }
      return new LongBits(lo, hi);
    };
    LongBits.from = function from(value) {
      if (typeof value === "number")
        return LongBits.fromNumber(value);
      if (util.isString(value)) {
        if (util.Long)
          value = util.Long.fromString(value);
        else
          return LongBits.fromNumber(parseInt(value, 10));
      }
      return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
    };
    LongBits.prototype.toNumber = function toNumber(unsigned) {
      if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0, hi = ~this.hi >>> 0;
        if (!lo)
          hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
      }
      return this.lo + this.hi * 4294967296;
    };
    LongBits.prototype.toLong = function toLong(unsigned) {
      return util.Long ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned)) : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
    };
    var charCodeAt = String.prototype.charCodeAt;
    LongBits.fromHash = function fromHash(hash) {
      if (hash === zeroHash)
        return zero;
      return new LongBits(
        (charCodeAt.call(hash, 0) | charCodeAt.call(hash, 1) << 8 | charCodeAt.call(hash, 2) << 16 | charCodeAt.call(hash, 3) << 24) >>> 0,
        (charCodeAt.call(hash, 4) | charCodeAt.call(hash, 5) << 8 | charCodeAt.call(hash, 6) << 16 | charCodeAt.call(hash, 7) << 24) >>> 0
      );
    };
    LongBits.prototype.toHash = function toHash() {
      return String.fromCharCode(
        this.lo & 255,
        this.lo >>> 8 & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24,
        this.hi & 255,
        this.hi >>> 8 & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
      );
    };
    LongBits.prototype.zzEncode = function zzEncode() {
      var mask = this.hi >> 31;
      this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
      this.lo = (this.lo << 1 ^ mask) >>> 0;
      return this;
    };
    LongBits.prototype.zzDecode = function zzDecode() {
      var mask = -(this.lo & 1);
      this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
      this.hi = (this.hi >>> 1 ^ mask) >>> 0;
      return this;
    };
    LongBits.prototype.length = function length() {
      var part0 = this.lo, part1 = (this.lo >>> 28 | this.hi << 4) >>> 0, part2 = this.hi >>> 24;
      return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
    };
  }
});

// node_modules/protobufjs/src/util/minimal.js
var require_minimal = __commonJS({
  "node_modules/protobufjs/src/util/minimal.js"(exports2) {
    "use strict";
    var util = exports2;
    util.asPromise = require_aspromise();
    util.base64 = require_base64();
    util.EventEmitter = require_eventemitter();
    util.float = require_float();
    util.inquire = require_inquire();
    util.utf8 = require_utf8();
    util.pool = require_pool();
    util.LongBits = require_longbits();
    util.isNode = Boolean(typeof global !== "undefined" && global && global.process && global.process.versions && global.process.versions.node);
    util.global = util.isNode && global || typeof window !== "undefined" && window || typeof self !== "undefined" && self || exports2;
    util.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    );
    util.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    );
    util.isInteger = Number.isInteger || /* istanbul ignore next */
    function isInteger(value) {
      return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };
    util.isString = function isString(value) {
      return typeof value === "string" || value instanceof String;
    };
    util.isObject = function isObject(value) {
      return value && typeof value === "object";
    };
    util.isset = /**
     * Checks if a property on a message is considered to be present.
     * @param {Object} obj Plain object or message instance
     * @param {string} prop Property name
     * @returns {boolean} `true` if considered to be present, otherwise `false`
     */
    util.isSet = function isSet2(obj, prop) {
      var value = obj[prop];
      if (value != null && obj.hasOwnProperty(prop))
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
      return false;
    };
    util.Buffer = function() {
      try {
        var Buffer2 = util.inquire("buffer").Buffer;
        return Buffer2.prototype.utf8Write ? Buffer2 : (
          /* istanbul ignore next */
          null
        );
      } catch (e) {
        return null;
      }
    }();
    util._Buffer_from = null;
    util._Buffer_allocUnsafe = null;
    util.newBuffer = function newBuffer(sizeOrArray) {
      return typeof sizeOrArray === "number" ? util.Buffer ? util._Buffer_allocUnsafe(sizeOrArray) : new util.Array(sizeOrArray) : util.Buffer ? util._Buffer_from(sizeOrArray) : typeof Uint8Array === "undefined" ? sizeOrArray : new Uint8Array(sizeOrArray);
    };
    util.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    util.Long = /* istanbul ignore next */
    util.global.dcodeIO && /* istanbul ignore next */
    util.global.dcodeIO.Long || /* istanbul ignore next */
    util.global.Long || util.inquire("long");
    util.key2Re = /^true|false|0|1$/;
    util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
    util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
    util.longToHash = function longToHash(value) {
      return value ? util.LongBits.from(value).toHash() : util.LongBits.zeroHash;
    };
    util.longFromHash = function longFromHash(hash, unsigned) {
      var bits = util.LongBits.fromHash(hash);
      if (util.Long)
        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
      return bits.toNumber(Boolean(unsigned));
    };
    function merge(dst, src, ifNotSet) {
      for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === void 0 || !ifNotSet)
          dst[keys[i]] = src[keys[i]];
      return dst;
    }
    util.merge = merge;
    util.lcFirst = function lcFirst(str) {
      return str.charAt(0).toLowerCase() + str.substring(1);
    };
    function newError(name) {
      function CustomError(message, properties) {
        if (!(this instanceof CustomError))
          return new CustomError(message, properties);
        Object.defineProperty(this, "message", { get: function() {
          return message;
        } });
        if (Error.captureStackTrace)
          Error.captureStackTrace(this, CustomError);
        else
          Object.defineProperty(this, "stack", { value: new Error().stack || "" });
        if (properties)
          merge(this, properties);
      }
      CustomError.prototype = Object.create(Error.prototype, {
        constructor: {
          value: CustomError,
          writable: true,
          enumerable: false,
          configurable: true
        },
        name: {
          get: function get() {
            return name;
          },
          set: void 0,
          enumerable: false,
          // configurable: false would accurately preserve the behavior of
          // the original, but I'm guessing that was not intentional.
          // For an actual error subclass, this property would
          // be configurable.
          configurable: true
        },
        toString: {
          value: function value() {
            return this.name + ": " + this.message;
          },
          writable: true,
          enumerable: false,
          configurable: true
        }
      });
      return CustomError;
    }
    util.newError = newError;
    util.ProtocolError = newError("ProtocolError");
    util.oneOfGetter = function getOneOf(fieldNames) {
      var fieldMap = {};
      for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;
      return function() {
        for (var keys = Object.keys(this), i2 = keys.length - 1; i2 > -1; --i2)
          if (fieldMap[keys[i2]] === 1 && this[keys[i2]] !== void 0 && this[keys[i2]] !== null)
            return keys[i2];
      };
    };
    util.oneOfSetter = function setOneOf(fieldNames) {
      return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
          if (fieldNames[i] !== name)
            delete this[fieldNames[i]];
      };
    };
    util.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: true
    };
    util._configure = function() {
      var Buffer2 = util.Buffer;
      if (!Buffer2) {
        util._Buffer_from = util._Buffer_allocUnsafe = null;
        return;
      }
      util._Buffer_from = Buffer2.from !== Uint8Array.from && Buffer2.from || /* istanbul ignore next */
      function Buffer_from(value, encoding) {
        return new Buffer2(value, encoding);
      };
      util._Buffer_allocUnsafe = Buffer2.allocUnsafe || /* istanbul ignore next */
      function Buffer_allocUnsafe(size) {
        return new Buffer2(size);
      };
    };
  }
});

// node_modules/protobufjs/src/writer.js
var require_writer = __commonJS({
  "node_modules/protobufjs/src/writer.js"(exports2, module2) {
    "use strict";
    module2.exports = Writer;
    var util = require_minimal();
    var BufferWriter;
    var LongBits = util.LongBits;
    var base64 = util.base64;
    var utf8 = util.utf8;
    function Op(fn, len, val) {
      this.fn = fn;
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    function noop() {
    }
    function State(writer) {
      this.head = writer.head;
      this.tail = writer.tail;
      this.len = writer.len;
      this.next = writer.states;
    }
    function Writer() {
      this.len = 0;
      this.head = new Op(noop, 0, 0);
      this.tail = this.head;
      this.states = null;
    }
    var create = function create2() {
      return util.Buffer ? function create_buffer_setup() {
        return (Writer.create = function create_buffer() {
          return new BufferWriter();
        })();
      } : function create_array() {
        return new Writer();
      };
    };
    Writer.create = create();
    Writer.alloc = function alloc(size) {
      return new util.Array(size);
    };
    if (util.Array !== Array)
      Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);
    Writer.prototype._push = function push(fn, len, val) {
      this.tail = this.tail.next = new Op(fn, len, val);
      this.len += len;
      return this;
    };
    function writeByte(val, buf, pos) {
      buf[pos] = val & 255;
    }
    function writeVarint32(val, buf, pos) {
      while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
      }
      buf[pos] = val;
    }
    function VarintOp(len, val) {
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    VarintOp.prototype = Object.create(Op.prototype);
    VarintOp.prototype.fn = writeVarint32;
    Writer.prototype.uint32 = function write_uint32(value) {
      this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5,
        value
      )).len;
      return this;
    };
    Writer.prototype.int32 = function write_int32(value) {
      return value < 0 ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) : this.uint32(value);
    };
    Writer.prototype.sint32 = function write_sint32(value) {
      return this.uint32((value << 1 ^ value >> 31) >>> 0);
    };
    function writeVarint64(val, buf, pos) {
      while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
      }
      while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
      }
      buf[pos++] = val.lo;
    }
    Writer.prototype.uint64 = function write_uint64(value) {
      var bits = LongBits.from(value);
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer.prototype.int64 = Writer.prototype.uint64;
    Writer.prototype.sint64 = function write_sint64(value) {
      var bits = LongBits.from(value).zzEncode();
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer.prototype.bool = function write_bool(value) {
      return this._push(writeByte, 1, value ? 1 : 0);
    };
    function writeFixed32(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    Writer.prototype.fixed32 = function write_fixed32(value) {
      return this._push(writeFixed32, 4, value >>> 0);
    };
    Writer.prototype.sfixed32 = Writer.prototype.fixed32;
    Writer.prototype.fixed64 = function write_fixed64(value) {
      var bits = LongBits.from(value);
      return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    };
    Writer.prototype.sfixed64 = Writer.prototype.fixed64;
    Writer.prototype.float = function write_float(value) {
      return this._push(util.float.writeFloatLE, 4, value);
    };
    Writer.prototype.double = function write_double(value) {
      return this._push(util.float.writeDoubleLE, 8, value);
    };
    var writeBytes = util.Array.prototype.set ? function writeBytes_set(val, buf, pos) {
      buf.set(val, pos);
    } : function writeBytes_for(val, buf, pos) {
      for (var i = 0; i < val.length; ++i)
        buf[pos + i] = val[i];
    };
    Writer.prototype.bytes = function write_bytes(value) {
      var len = value.length >>> 0;
      if (!len)
        return this._push(writeByte, 1, 0);
      if (util.isString(value)) {
        var buf = Writer.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
      }
      return this.uint32(len)._push(writeBytes, len, value);
    };
    Writer.prototype.string = function write_string(value) {
      var len = utf8.length(value);
      return len ? this.uint32(len)._push(utf8.write, len, value) : this._push(writeByte, 1, 0);
    };
    Writer.prototype.fork = function fork() {
      this.states = new State(this);
      this.head = this.tail = new Op(noop, 0, 0);
      this.len = 0;
      return this;
    };
    Writer.prototype.reset = function reset() {
      if (this.states) {
        this.head = this.states.head;
        this.tail = this.states.tail;
        this.len = this.states.len;
        this.states = this.states.next;
      } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len = 0;
      }
      return this;
    };
    Writer.prototype.ldelim = function ldelim() {
      var head = this.head, tail = this.tail, len = this.len;
      this.reset().uint32(len);
      if (len) {
        this.tail.next = head.next;
        this.tail = tail;
        this.len += len;
      }
      return this;
    };
    Writer.prototype.finish = function finish() {
      var head = this.head.next, buf = this.constructor.alloc(this.len), pos = 0;
      while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
      }
      return buf;
    };
    Writer._configure = function(BufferWriter_) {
      BufferWriter = BufferWriter_;
      Writer.create = create();
      BufferWriter._configure();
    };
  }
});

// node_modules/protobufjs/src/writer_buffer.js
var require_writer_buffer = __commonJS({
  "node_modules/protobufjs/src/writer_buffer.js"(exports2, module2) {
    "use strict";
    module2.exports = BufferWriter;
    var Writer = require_writer();
    (BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;
    var util = require_minimal();
    function BufferWriter() {
      Writer.call(this);
    }
    BufferWriter._configure = function() {
      BufferWriter.alloc = util._Buffer_allocUnsafe;
      BufferWriter.writeBytesBuffer = util.Buffer && util.Buffer.prototype instanceof Uint8Array && util.Buffer.prototype.set.name === "set" ? function writeBytesBuffer_set(val, buf, pos) {
        buf.set(val, pos);
      } : function writeBytesBuffer_copy(val, buf, pos) {
        if (val.copy)
          val.copy(buf, pos, 0, val.length);
        else
          for (var i = 0; i < val.length; )
            buf[pos++] = val[i++];
      };
    };
    BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
      if (util.isString(value))
        value = util._Buffer_from(value, "base64");
      var len = value.length >>> 0;
      this.uint32(len);
      if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
      return this;
    };
    function writeStringBuffer(val, buf, pos) {
      if (val.length < 40)
        util.utf8.write(val, buf, pos);
      else if (buf.utf8Write)
        buf.utf8Write(val, pos);
      else
        buf.write(val, pos);
    }
    BufferWriter.prototype.string = function write_string_buffer(value) {
      var len = util.Buffer.byteLength(value);
      this.uint32(len);
      if (len)
        this._push(writeStringBuffer, len, value);
      return this;
    };
    BufferWriter._configure();
  }
});

// node_modules/protobufjs/src/reader.js
var require_reader = __commonJS({
  "node_modules/protobufjs/src/reader.js"(exports2, module2) {
    "use strict";
    module2.exports = Reader;
    var util = require_minimal();
    var BufferReader;
    var LongBits = util.LongBits;
    var utf8 = util.utf8;
    function indexOutOfRange(reader, writeLength) {
      return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
    }
    function Reader(buffer) {
      this.buf = buffer;
      this.pos = 0;
      this.len = buffer.length;
    }
    var create_array = typeof Uint8Array !== "undefined" ? function create_typed_array(buffer) {
      if (buffer instanceof Uint8Array || Array.isArray(buffer))
        return new Reader(buffer);
      throw Error("illegal buffer");
    } : function create_array2(buffer) {
      if (Array.isArray(buffer))
        return new Reader(buffer);
      throw Error("illegal buffer");
    };
    var create = function create2() {
      return util.Buffer ? function create_buffer_setup(buffer) {
        return (Reader.create = function create_buffer(buffer2) {
          return util.Buffer.isBuffer(buffer2) ? new BufferReader(buffer2) : create_array(buffer2);
        })(buffer);
      } : create_array;
    };
    Reader.create = create();
    Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */
    util.Array.prototype.slice;
    Reader.prototype.uint32 = function read_uint32_setup() {
      var value = 4294967295;
      return function read_uint32() {
        value = (this.buf[this.pos] & 127) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        if ((this.pos += 5) > this.len) {
          this.pos = this.len;
          throw indexOutOfRange(this, 10);
        }
        return value;
      };
    }();
    Reader.prototype.int32 = function read_int32() {
      return this.uint32() | 0;
    };
    Reader.prototype.sint32 = function read_sint32() {
      var value = this.uint32();
      return value >>> 1 ^ -(value & 1) | 0;
    };
    function readLongVarint() {
      var bits = new LongBits(0, 0);
      var i = 0;
      if (this.len - this.pos > 4) {
        for (; i < 4; ++i) {
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
        if (this.buf[this.pos++] < 128)
          return bits;
        i = 0;
      } else {
        for (; i < 3; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
      }
      if (this.len - this.pos > 4) {
        for (; i < 5; ++i) {
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      } else {
        for (; i < 5; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      }
      throw Error("invalid varint encoding");
    }
    Reader.prototype.bool = function read_bool() {
      return this.uint32() !== 0;
    };
    function readFixed32_end(buf, end) {
      return (buf[end - 4] | buf[end - 3] << 8 | buf[end - 2] << 16 | buf[end - 1] << 24) >>> 0;
    }
    Reader.prototype.fixed32 = function read_fixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4);
    };
    Reader.prototype.sfixed32 = function read_sfixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4) | 0;
    };
    function readFixed64() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);
      return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
    }
    Reader.prototype.float = function read_float() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util.float.readFloatLE(this.buf, this.pos);
      this.pos += 4;
      return value;
    };
    Reader.prototype.double = function read_double() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util.float.readDoubleLE(this.buf, this.pos);
      this.pos += 8;
      return value;
    };
    Reader.prototype.bytes = function read_bytes() {
      var length = this.uint32(), start = this.pos, end = this.pos + length;
      if (end > this.len)
        throw indexOutOfRange(this, length);
      this.pos += length;
      if (Array.isArray(this.buf))
        return this.buf.slice(start, end);
      if (start === end) {
        var nativeBuffer = util.Buffer;
        return nativeBuffer ? nativeBuffer.alloc(0) : new this.buf.constructor(0);
      }
      return this._slice.call(this.buf, start, end);
    };
    Reader.prototype.string = function read_string() {
      var bytes = this.bytes();
      return utf8.read(bytes, 0, bytes.length);
    };
    Reader.prototype.skip = function skip(length) {
      if (typeof length === "number") {
        if (this.pos + length > this.len)
          throw indexOutOfRange(this, length);
        this.pos += length;
      } else {
        do {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
      }
      return this;
    };
    Reader.prototype.skipType = function(wireType) {
      switch (wireType) {
        case 0:
          this.skip();
          break;
        case 1:
          this.skip(8);
          break;
        case 2:
          this.skip(this.uint32());
          break;
        case 3:
          while ((wireType = this.uint32() & 7) !== 4) {
            this.skipType(wireType);
          }
          break;
        case 5:
          this.skip(4);
          break;
        default:
          throw Error("invalid wire type " + wireType + " at offset " + this.pos);
      }
      return this;
    };
    Reader._configure = function(BufferReader_) {
      BufferReader = BufferReader_;
      Reader.create = create();
      BufferReader._configure();
      var fn = util.Long ? "toLong" : (
        /* istanbul ignore next */
        "toNumber"
      );
      util.merge(Reader.prototype, {
        int64: function read_int64() {
          return readLongVarint.call(this)[fn](false);
        },
        uint64: function read_uint64() {
          return readLongVarint.call(this)[fn](true);
        },
        sint64: function read_sint64() {
          return readLongVarint.call(this).zzDecode()[fn](false);
        },
        fixed64: function read_fixed64() {
          return readFixed64.call(this)[fn](true);
        },
        sfixed64: function read_sfixed64() {
          return readFixed64.call(this)[fn](false);
        }
      });
    };
  }
});

// node_modules/protobufjs/src/reader_buffer.js
var require_reader_buffer = __commonJS({
  "node_modules/protobufjs/src/reader_buffer.js"(exports2, module2) {
    "use strict";
    module2.exports = BufferReader;
    var Reader = require_reader();
    (BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;
    var util = require_minimal();
    function BufferReader(buffer) {
      Reader.call(this, buffer);
    }
    BufferReader._configure = function() {
      if (util.Buffer)
        BufferReader.prototype._slice = util.Buffer.prototype.slice;
    };
    BufferReader.prototype.string = function read_string_buffer() {
      var len = this.uint32();
      return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
    };
    BufferReader._configure();
  }
});

// node_modules/protobufjs/src/rpc/service.js
var require_service = __commonJS({
  "node_modules/protobufjs/src/rpc/service.js"(exports2, module2) {
    "use strict";
    module2.exports = Service;
    var util = require_minimal();
    (Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;
    function Service(rpcImpl, requestDelimited, responseDelimited) {
      if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");
      util.EventEmitter.call(this);
      this.rpcImpl = rpcImpl;
      this.requestDelimited = Boolean(requestDelimited);
      this.responseDelimited = Boolean(responseDelimited);
    }
    Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {
      if (!request)
        throw TypeError("request must be specified");
      var self2 = this;
      if (!callback)
        return util.asPromise(rpcCall, self2, method, requestCtor, responseCtor, request);
      if (!self2.rpcImpl) {
        setTimeout(function() {
          callback(Error("already ended"));
        }, 0);
        return void 0;
      }
      try {
        return self2.rpcImpl(
          method,
          requestCtor[self2.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
          function rpcCallback(err, response) {
            if (err) {
              self2.emit("error", err, method);
              return callback(err);
            }
            if (response === null) {
              self2.end(
                /* endedByRPC */
                true
              );
              return void 0;
            }
            if (!(response instanceof responseCtor)) {
              try {
                response = responseCtor[self2.responseDelimited ? "decodeDelimited" : "decode"](response);
              } catch (err2) {
                self2.emit("error", err2, method);
                return callback(err2);
              }
            }
            self2.emit("data", response, method);
            return callback(null, response);
          }
        );
      } catch (err) {
        self2.emit("error", err, method);
        setTimeout(function() {
          callback(err);
        }, 0);
        return void 0;
      }
    };
    Service.prototype.end = function end(endedByRPC) {
      if (this.rpcImpl) {
        if (!endedByRPC)
          this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
      }
      return this;
    };
  }
});

// node_modules/protobufjs/src/rpc.js
var require_rpc = __commonJS({
  "node_modules/protobufjs/src/rpc.js"(exports2) {
    "use strict";
    var rpc = exports2;
    rpc.Service = require_service();
  }
});

// node_modules/protobufjs/src/roots.js
var require_roots = __commonJS({
  "node_modules/protobufjs/src/roots.js"(exports2, module2) {
    "use strict";
    module2.exports = {};
  }
});

// node_modules/protobufjs/src/index-minimal.js
var require_index_minimal = __commonJS({
  "node_modules/protobufjs/src/index-minimal.js"(exports2) {
    "use strict";
    var protobuf = exports2;
    protobuf.build = "minimal";
    protobuf.Writer = require_writer();
    protobuf.BufferWriter = require_writer_buffer();
    protobuf.Reader = require_reader();
    protobuf.BufferReader = require_reader_buffer();
    protobuf.util = require_minimal();
    protobuf.rpc = require_rpc();
    protobuf.roots = require_roots();
    protobuf.configure = configure;
    function configure() {
      protobuf.util._configure();
      protobuf.Writer._configure(protobuf.BufferWriter);
      protobuf.Reader._configure(protobuf.BufferReader);
    }
    configure();
  }
});

// node_modules/protobufjs/minimal.js
var require_minimal2 = __commonJS({
  "node_modules/protobufjs/minimal.js"(exports2, module2) {
    "use strict";
    module2.exports = require_index_minimal();
  }
});

// build/ts/vochain/index.ts
var vochain_exports = {};
__export(vochain_exports, {
  Account: () => Account,
  AdminTx: () => AdminTx,
  CAbundle: () => CAbundle,
  Census: () => Census,
  CensusOrigin: () => CensusOrigin,
  Census_Type: () => Census_Type,
  CollectFaucetTx: () => CollectFaucetTx,
  EnvelopeType: () => EnvelopeType,
  FaucetPackage: () => FaucetPackage,
  FaucetPayload: () => FaucetPayload,
  NewProcessTx: () => NewProcessTx,
  OracleList: () => OracleList,
  Process: () => Process,
  ProcessEndingList: () => ProcessEndingList,
  ProcessMode: () => ProcessMode,
  ProcessResult: () => ProcessResult,
  ProcessStatus: () => ProcessStatus,
  ProcessVoteOptions: () => ProcessVoteOptions,
  Proof: () => Proof,
  ProofArbo: () => ProofArbo,
  ProofArbo_KeyType: () => ProofArbo_KeyType,
  ProofArbo_Type: () => ProofArbo_Type,
  ProofCA: () => ProofCA,
  ProofCA_Type: () => ProofCA_Type,
  ProofEthereumAccount: () => ProofEthereumAccount,
  ProofEthereumStorage: () => ProofEthereumStorage,
  ProofFarcasterFrame: () => ProofFarcasterFrame,
  ProofMinime: () => ProofMinime,
  ProofZkSNARK: () => ProofZkSNARK,
  QuestionResult: () => QuestionResult,
  RegisterKeyTx: () => RegisterKeyTx,
  RegisterSIKTx: () => RegisterSIKTx,
  SIKTx: () => SIKTx,
  SendTokensTx: () => SendTokensTx,
  SetAccountTx: () => SetAccountTx,
  SetKeykeeperTx: () => SetKeykeeperTx,
  SetProcessTx: () => SetProcessTx,
  SetTransactionCostsTx: () => SetTransactionCostsTx,
  SignedTx: () => SignedTx,
  SourceNetworkId: () => SourceNetworkId,
  StoredKeys: () => StoredKeys,
  TendermintHeader: () => TendermintHeader,
  Tx: () => Tx,
  TxType: () => TxType,
  Validator: () => Validator,
  ValidatorList: () => ValidatorList,
  VoteEnvelope: () => VoteEnvelope,
  censusOriginFromJSON: () => censusOriginFromJSON,
  censusOriginToJSON: () => censusOriginToJSON,
  census_TypeFromJSON: () => census_TypeFromJSON,
  census_TypeToJSON: () => census_TypeToJSON,
  processStatusFromJSON: () => processStatusFromJSON,
  processStatusToJSON: () => processStatusToJSON,
  proofArbo_KeyTypeFromJSON: () => proofArbo_KeyTypeFromJSON,
  proofArbo_KeyTypeToJSON: () => proofArbo_KeyTypeToJSON,
  proofArbo_TypeFromJSON: () => proofArbo_TypeFromJSON,
  proofArbo_TypeToJSON: () => proofArbo_TypeToJSON,
  proofCA_TypeFromJSON: () => proofCA_TypeFromJSON,
  proofCA_TypeToJSON: () => proofCA_TypeToJSON,
  sourceNetworkIdFromJSON: () => sourceNetworkIdFromJSON,
  sourceNetworkIdToJSON: () => sourceNetworkIdToJSON,
  txTypeFromJSON: () => txTypeFromJSON,
  txTypeToJSON: () => txTypeToJSON
});
module.exports = __toCommonJS(vochain_exports);

// build/ts/vochain/vochain.ts
var import_long = __toESM(require("long"));
var import_minimal = __toESM(require_minimal2());
var TxType = /* @__PURE__ */ ((TxType2) => {
  TxType2[TxType2["TX_UNKNOWN"] = 0] = "TX_UNKNOWN";
  TxType2[TxType2["NEW_PROCESS"] = 1] = "NEW_PROCESS";
  TxType2[TxType2["SET_PROCESS_STATUS"] = 2] = "SET_PROCESS_STATUS";
  TxType2[TxType2["SET_PROCESS_CENSUS"] = 3] = "SET_PROCESS_CENSUS";
  TxType2[TxType2["SET_PROCESS_QUESTION_INDEX"] = 4] = "SET_PROCESS_QUESTION_INDEX";
  TxType2[TxType2["ADD_PROCESS_KEYS"] = 5] = "ADD_PROCESS_KEYS";
  TxType2[TxType2["REVEAL_PROCESS_KEYS"] = 6] = "REVEAL_PROCESS_KEYS";
  TxType2[TxType2["ADD_ORACLE"] = 7] = "ADD_ORACLE";
  TxType2[TxType2["REMOVE_ORACLE"] = 8] = "REMOVE_ORACLE";
  TxType2[TxType2["ADD_VALIDATOR"] = 9] = "ADD_VALIDATOR";
  TxType2[TxType2["REMOVE_VALIDATOR"] = 10] = "REMOVE_VALIDATOR";
  TxType2[TxType2["VOTE"] = 11] = "VOTE";
  TxType2[TxType2["SET_PROCESS_RESULTS"] = 12] = "SET_PROCESS_RESULTS";
  TxType2[TxType2["REGISTER_VOTER_KEY"] = 13] = "REGISTER_VOTER_KEY";
  TxType2[TxType2["SEND_TOKENS"] = 15] = "SEND_TOKENS";
  TxType2[TxType2["SET_ACCOUNT_INFO_URI"] = 17] = "SET_ACCOUNT_INFO_URI";
  TxType2[TxType2["ADD_DELEGATE_FOR_ACCOUNT"] = 18] = "ADD_DELEGATE_FOR_ACCOUNT";
  TxType2[TxType2["DEL_DELEGATE_FOR_ACCOUNT"] = 19] = "DEL_DELEGATE_FOR_ACCOUNT";
  TxType2[TxType2["COLLECT_FAUCET"] = 20] = "COLLECT_FAUCET";
  TxType2[TxType2["ADD_KEYKEEPER"] = 21] = "ADD_KEYKEEPER";
  TxType2[TxType2["DELETE_KEYKEEPER"] = 22] = "DELETE_KEYKEEPER";
  TxType2[TxType2["CREATE_ACCOUNT"] = 23] = "CREATE_ACCOUNT";
  TxType2[TxType2["SET_ACCOUNT_SIK"] = 24] = "SET_ACCOUNT_SIK";
  TxType2[TxType2["DEL_ACCOUNT_SIK"] = 25] = "DEL_ACCOUNT_SIK";
  TxType2[TxType2["REGISTER_SIK"] = 26] = "REGISTER_SIK";
  TxType2[TxType2["SET_ACCOUNT_VALIDATOR"] = 27] = "SET_ACCOUNT_VALIDATOR";
  TxType2[TxType2["SET_PROCESS_DURATION"] = 28] = "SET_PROCESS_DURATION";
  TxType2[TxType2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
  return TxType2;
})(TxType || {});
function txTypeFromJSON(object) {
  switch (object) {
    case 0:
    case "TX_UNKNOWN":
      return 0 /* TX_UNKNOWN */;
    case 1:
    case "NEW_PROCESS":
      return 1 /* NEW_PROCESS */;
    case 2:
    case "SET_PROCESS_STATUS":
      return 2 /* SET_PROCESS_STATUS */;
    case 3:
    case "SET_PROCESS_CENSUS":
      return 3 /* SET_PROCESS_CENSUS */;
    case 4:
    case "SET_PROCESS_QUESTION_INDEX":
      return 4 /* SET_PROCESS_QUESTION_INDEX */;
    case 5:
    case "ADD_PROCESS_KEYS":
      return 5 /* ADD_PROCESS_KEYS */;
    case 6:
    case "REVEAL_PROCESS_KEYS":
      return 6 /* REVEAL_PROCESS_KEYS */;
    case 7:
    case "ADD_ORACLE":
      return 7 /* ADD_ORACLE */;
    case 8:
    case "REMOVE_ORACLE":
      return 8 /* REMOVE_ORACLE */;
    case 9:
    case "ADD_VALIDATOR":
      return 9 /* ADD_VALIDATOR */;
    case 10:
    case "REMOVE_VALIDATOR":
      return 10 /* REMOVE_VALIDATOR */;
    case 11:
    case "VOTE":
      return 11 /* VOTE */;
    case 12:
    case "SET_PROCESS_RESULTS":
      return 12 /* SET_PROCESS_RESULTS */;
    case 13:
    case "REGISTER_VOTER_KEY":
      return 13 /* REGISTER_VOTER_KEY */;
    case 15:
    case "SEND_TOKENS":
      return 15 /* SEND_TOKENS */;
    case 17:
    case "SET_ACCOUNT_INFO_URI":
      return 17 /* SET_ACCOUNT_INFO_URI */;
    case 18:
    case "ADD_DELEGATE_FOR_ACCOUNT":
      return 18 /* ADD_DELEGATE_FOR_ACCOUNT */;
    case 19:
    case "DEL_DELEGATE_FOR_ACCOUNT":
      return 19 /* DEL_DELEGATE_FOR_ACCOUNT */;
    case 20:
    case "COLLECT_FAUCET":
      return 20 /* COLLECT_FAUCET */;
    case 21:
    case "ADD_KEYKEEPER":
      return 21 /* ADD_KEYKEEPER */;
    case 22:
    case "DELETE_KEYKEEPER":
      return 22 /* DELETE_KEYKEEPER */;
    case 23:
    case "CREATE_ACCOUNT":
      return 23 /* CREATE_ACCOUNT */;
    case 24:
    case "SET_ACCOUNT_SIK":
      return 24 /* SET_ACCOUNT_SIK */;
    case 25:
    case "DEL_ACCOUNT_SIK":
      return 25 /* DEL_ACCOUNT_SIK */;
    case 26:
    case "REGISTER_SIK":
      return 26 /* REGISTER_SIK */;
    case 27:
    case "SET_ACCOUNT_VALIDATOR":
      return 27 /* SET_ACCOUNT_VALIDATOR */;
    case 28:
    case "SET_PROCESS_DURATION":
      return 28 /* SET_PROCESS_DURATION */;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1 /* UNRECOGNIZED */;
  }
}
function txTypeToJSON(object) {
  switch (object) {
    case 0 /* TX_UNKNOWN */:
      return "TX_UNKNOWN";
    case 1 /* NEW_PROCESS */:
      return "NEW_PROCESS";
    case 2 /* SET_PROCESS_STATUS */:
      return "SET_PROCESS_STATUS";
    case 3 /* SET_PROCESS_CENSUS */:
      return "SET_PROCESS_CENSUS";
    case 4 /* SET_PROCESS_QUESTION_INDEX */:
      return "SET_PROCESS_QUESTION_INDEX";
    case 5 /* ADD_PROCESS_KEYS */:
      return "ADD_PROCESS_KEYS";
    case 6 /* REVEAL_PROCESS_KEYS */:
      return "REVEAL_PROCESS_KEYS";
    case 7 /* ADD_ORACLE */:
      return "ADD_ORACLE";
    case 8 /* REMOVE_ORACLE */:
      return "REMOVE_ORACLE";
    case 9 /* ADD_VALIDATOR */:
      return "ADD_VALIDATOR";
    case 10 /* REMOVE_VALIDATOR */:
      return "REMOVE_VALIDATOR";
    case 11 /* VOTE */:
      return "VOTE";
    case 12 /* SET_PROCESS_RESULTS */:
      return "SET_PROCESS_RESULTS";
    case 13 /* REGISTER_VOTER_KEY */:
      return "REGISTER_VOTER_KEY";
    case 15 /* SEND_TOKENS */:
      return "SEND_TOKENS";
    case 17 /* SET_ACCOUNT_INFO_URI */:
      return "SET_ACCOUNT_INFO_URI";
    case 18 /* ADD_DELEGATE_FOR_ACCOUNT */:
      return "ADD_DELEGATE_FOR_ACCOUNT";
    case 19 /* DEL_DELEGATE_FOR_ACCOUNT */:
      return "DEL_DELEGATE_FOR_ACCOUNT";
    case 20 /* COLLECT_FAUCET */:
      return "COLLECT_FAUCET";
    case 21 /* ADD_KEYKEEPER */:
      return "ADD_KEYKEEPER";
    case 22 /* DELETE_KEYKEEPER */:
      return "DELETE_KEYKEEPER";
    case 23 /* CREATE_ACCOUNT */:
      return "CREATE_ACCOUNT";
    case 24 /* SET_ACCOUNT_SIK */:
      return "SET_ACCOUNT_SIK";
    case 25 /* DEL_ACCOUNT_SIK */:
      return "DEL_ACCOUNT_SIK";
    case 26 /* REGISTER_SIK */:
      return "REGISTER_SIK";
    case 27 /* SET_ACCOUNT_VALIDATOR */:
      return "SET_ACCOUNT_VALIDATOR";
    case 28 /* SET_PROCESS_DURATION */:
      return "SET_PROCESS_DURATION";
    case -1 /* UNRECOGNIZED */:
    default:
      return "UNRECOGNIZED";
  }
}
var ProcessStatus = /* @__PURE__ */ ((ProcessStatus2) => {
  ProcessStatus2[ProcessStatus2["PROCESS_UNKNOWN"] = 0] = "PROCESS_UNKNOWN";
  ProcessStatus2[ProcessStatus2["READY"] = 1] = "READY";
  ProcessStatus2[ProcessStatus2["ENDED"] = 2] = "ENDED";
  ProcessStatus2[ProcessStatus2["CANCELED"] = 3] = "CANCELED";
  ProcessStatus2[ProcessStatus2["PAUSED"] = 4] = "PAUSED";
  ProcessStatus2[ProcessStatus2["RESULTS"] = 5] = "RESULTS";
  ProcessStatus2[ProcessStatus2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
  return ProcessStatus2;
})(ProcessStatus || {});
function processStatusFromJSON(object) {
  switch (object) {
    case 0:
    case "PROCESS_UNKNOWN":
      return 0 /* PROCESS_UNKNOWN */;
    case 1:
    case "READY":
      return 1 /* READY */;
    case 2:
    case "ENDED":
      return 2 /* ENDED */;
    case 3:
    case "CANCELED":
      return 3 /* CANCELED */;
    case 4:
    case "PAUSED":
      return 4 /* PAUSED */;
    case 5:
    case "RESULTS":
      return 5 /* RESULTS */;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1 /* UNRECOGNIZED */;
  }
}
function processStatusToJSON(object) {
  switch (object) {
    case 0 /* PROCESS_UNKNOWN */:
      return "PROCESS_UNKNOWN";
    case 1 /* READY */:
      return "READY";
    case 2 /* ENDED */:
      return "ENDED";
    case 3 /* CANCELED */:
      return "CANCELED";
    case 4 /* PAUSED */:
      return "PAUSED";
    case 5 /* RESULTS */:
      return "RESULTS";
    case -1 /* UNRECOGNIZED */:
    default:
      return "UNRECOGNIZED";
  }
}
var SourceNetworkId = /* @__PURE__ */ ((SourceNetworkId2) => {
  SourceNetworkId2[SourceNetworkId2["UNKNOWN"] = 0] = "UNKNOWN";
  SourceNetworkId2[SourceNetworkId2["ETH_MAINNET"] = 1] = "ETH_MAINNET";
  SourceNetworkId2[SourceNetworkId2["ETH_RINKEBY"] = 2] = "ETH_RINKEBY";
  SourceNetworkId2[SourceNetworkId2["ETH_GOERLI"] = 3] = "ETH_GOERLI";
  SourceNetworkId2[SourceNetworkId2["POA_XDAI"] = 4] = "POA_XDAI";
  SourceNetworkId2[SourceNetworkId2["POA_SOKOL"] = 5] = "POA_SOKOL";
  SourceNetworkId2[SourceNetworkId2["POLYGON"] = 6] = "POLYGON";
  SourceNetworkId2[SourceNetworkId2["BSC"] = 7] = "BSC";
  SourceNetworkId2[SourceNetworkId2["ETH_MAINNET_SIGNALING"] = 8] = "ETH_MAINNET_SIGNALING";
  SourceNetworkId2[SourceNetworkId2["ETH_RINKEBY_SIGNALING"] = 9] = "ETH_RINKEBY_SIGNALING";
  SourceNetworkId2[SourceNetworkId2["AVAX_FUJI"] = 10] = "AVAX_FUJI";
  SourceNetworkId2[SourceNetworkId2["AVAX"] = 11] = "AVAX";
  SourceNetworkId2[SourceNetworkId2["POLYGON_MUMBAI"] = 12] = "POLYGON_MUMBAI";
  SourceNetworkId2[SourceNetworkId2["OPTIMISM"] = 13] = "OPTIMISM";
  SourceNetworkId2[SourceNetworkId2["ARBITRUM"] = 14] = "ARBITRUM";
  SourceNetworkId2[SourceNetworkId2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
  return SourceNetworkId2;
})(SourceNetworkId || {});
function sourceNetworkIdFromJSON(object) {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return 0 /* UNKNOWN */;
    case 1:
    case "ETH_MAINNET":
      return 1 /* ETH_MAINNET */;
    case 2:
    case "ETH_RINKEBY":
      return 2 /* ETH_RINKEBY */;
    case 3:
    case "ETH_GOERLI":
      return 3 /* ETH_GOERLI */;
    case 4:
    case "POA_XDAI":
      return 4 /* POA_XDAI */;
    case 5:
    case "POA_SOKOL":
      return 5 /* POA_SOKOL */;
    case 6:
    case "POLYGON":
      return 6 /* POLYGON */;
    case 7:
    case "BSC":
      return 7 /* BSC */;
    case 8:
    case "ETH_MAINNET_SIGNALING":
      return 8 /* ETH_MAINNET_SIGNALING */;
    case 9:
    case "ETH_RINKEBY_SIGNALING":
      return 9 /* ETH_RINKEBY_SIGNALING */;
    case 10:
    case "AVAX_FUJI":
      return 10 /* AVAX_FUJI */;
    case 11:
    case "AVAX":
      return 11 /* AVAX */;
    case 12:
    case "POLYGON_MUMBAI":
      return 12 /* POLYGON_MUMBAI */;
    case 13:
    case "OPTIMISM":
      return 13 /* OPTIMISM */;
    case 14:
    case "ARBITRUM":
      return 14 /* ARBITRUM */;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1 /* UNRECOGNIZED */;
  }
}
function sourceNetworkIdToJSON(object) {
  switch (object) {
    case 0 /* UNKNOWN */:
      return "UNKNOWN";
    case 1 /* ETH_MAINNET */:
      return "ETH_MAINNET";
    case 2 /* ETH_RINKEBY */:
      return "ETH_RINKEBY";
    case 3 /* ETH_GOERLI */:
      return "ETH_GOERLI";
    case 4 /* POA_XDAI */:
      return "POA_XDAI";
    case 5 /* POA_SOKOL */:
      return "POA_SOKOL";
    case 6 /* POLYGON */:
      return "POLYGON";
    case 7 /* BSC */:
      return "BSC";
    case 8 /* ETH_MAINNET_SIGNALING */:
      return "ETH_MAINNET_SIGNALING";
    case 9 /* ETH_RINKEBY_SIGNALING */:
      return "ETH_RINKEBY_SIGNALING";
    case 10 /* AVAX_FUJI */:
      return "AVAX_FUJI";
    case 11 /* AVAX */:
      return "AVAX";
    case 12 /* POLYGON_MUMBAI */:
      return "POLYGON_MUMBAI";
    case 13 /* OPTIMISM */:
      return "OPTIMISM";
    case 14 /* ARBITRUM */:
      return "ARBITRUM";
    case -1 /* UNRECOGNIZED */:
    default:
      return "UNRECOGNIZED";
  }
}
var CensusOrigin = /* @__PURE__ */ ((CensusOrigin2) => {
  CensusOrigin2[CensusOrigin2["CENSUS_UNKNOWN"] = 0] = "CENSUS_UNKNOWN";
  CensusOrigin2[CensusOrigin2["OFF_CHAIN_TREE"] = 1] = "OFF_CHAIN_TREE";
  CensusOrigin2[CensusOrigin2["OFF_CHAIN_TREE_WEIGHTED"] = 2] = "OFF_CHAIN_TREE_WEIGHTED";
  CensusOrigin2[CensusOrigin2["OFF_CHAIN_CA"] = 3] = "OFF_CHAIN_CA";
  CensusOrigin2[CensusOrigin2["ERC20"] = 11] = "ERC20";
  CensusOrigin2[CensusOrigin2["ERC721"] = 12] = "ERC721";
  CensusOrigin2[CensusOrigin2["ERC1155"] = 13] = "ERC1155";
  CensusOrigin2[CensusOrigin2["ERC777"] = 14] = "ERC777";
  CensusOrigin2[CensusOrigin2["MINI_ME"] = 15] = "MINI_ME";
  CensusOrigin2[CensusOrigin2["FARCASTER_FRAME"] = 16] = "FARCASTER_FRAME";
  CensusOrigin2[CensusOrigin2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
  return CensusOrigin2;
})(CensusOrigin || {});
function censusOriginFromJSON(object) {
  switch (object) {
    case 0:
    case "CENSUS_UNKNOWN":
      return 0 /* CENSUS_UNKNOWN */;
    case 1:
    case "OFF_CHAIN_TREE":
      return 1 /* OFF_CHAIN_TREE */;
    case 2:
    case "OFF_CHAIN_TREE_WEIGHTED":
      return 2 /* OFF_CHAIN_TREE_WEIGHTED */;
    case 3:
    case "OFF_CHAIN_CA":
      return 3 /* OFF_CHAIN_CA */;
    case 11:
    case "ERC20":
      return 11 /* ERC20 */;
    case 12:
    case "ERC721":
      return 12 /* ERC721 */;
    case 13:
    case "ERC1155":
      return 13 /* ERC1155 */;
    case 14:
    case "ERC777":
      return 14 /* ERC777 */;
    case 15:
    case "MINI_ME":
      return 15 /* MINI_ME */;
    case 16:
    case "FARCASTER_FRAME":
      return 16 /* FARCASTER_FRAME */;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1 /* UNRECOGNIZED */;
  }
}
function censusOriginToJSON(object) {
  switch (object) {
    case 0 /* CENSUS_UNKNOWN */:
      return "CENSUS_UNKNOWN";
    case 1 /* OFF_CHAIN_TREE */:
      return "OFF_CHAIN_TREE";
    case 2 /* OFF_CHAIN_TREE_WEIGHTED */:
      return "OFF_CHAIN_TREE_WEIGHTED";
    case 3 /* OFF_CHAIN_CA */:
      return "OFF_CHAIN_CA";
    case 11 /* ERC20 */:
      return "ERC20";
    case 12 /* ERC721 */:
      return "ERC721";
    case 13 /* ERC1155 */:
      return "ERC1155";
    case 14 /* ERC777 */:
      return "ERC777";
    case 15 /* MINI_ME */:
      return "MINI_ME";
    case 16 /* FARCASTER_FRAME */:
      return "FARCASTER_FRAME";
    case -1 /* UNRECOGNIZED */:
    default:
      return "UNRECOGNIZED";
  }
}
var Census_Type = /* @__PURE__ */ ((Census_Type2) => {
  Census_Type2[Census_Type2["UNKNOWN"] = 0] = "UNKNOWN";
  Census_Type2[Census_Type2["ARBO_BLAKE2B"] = 1] = "ARBO_BLAKE2B";
  Census_Type2[Census_Type2["ARBO_POSEIDON"] = 2] = "ARBO_POSEIDON";
  Census_Type2[Census_Type2["ETHEREUMSTORAGE"] = 3] = "ETHEREUMSTORAGE";
  Census_Type2[Census_Type2["ETHEREUMACCOUNT"] = 4] = "ETHEREUMACCOUNT";
  Census_Type2[Census_Type2["CA"] = 5] = "CA";
  Census_Type2[Census_Type2["FARCASTER_FRAME"] = 6] = "FARCASTER_FRAME";
  Census_Type2[Census_Type2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
  return Census_Type2;
})(Census_Type || {});
function census_TypeFromJSON(object) {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return 0 /* UNKNOWN */;
    case 1:
    case "ARBO_BLAKE2B":
      return 1 /* ARBO_BLAKE2B */;
    case 2:
    case "ARBO_POSEIDON":
      return 2 /* ARBO_POSEIDON */;
    case 3:
    case "ETHEREUMSTORAGE":
      return 3 /* ETHEREUMSTORAGE */;
    case 4:
    case "ETHEREUMACCOUNT":
      return 4 /* ETHEREUMACCOUNT */;
    case 5:
    case "CA":
      return 5 /* CA */;
    case 6:
    case "FARCASTER_FRAME":
      return 6 /* FARCASTER_FRAME */;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1 /* UNRECOGNIZED */;
  }
}
function census_TypeToJSON(object) {
  switch (object) {
    case 0 /* UNKNOWN */:
      return "UNKNOWN";
    case 1 /* ARBO_BLAKE2B */:
      return "ARBO_BLAKE2B";
    case 2 /* ARBO_POSEIDON */:
      return "ARBO_POSEIDON";
    case 3 /* ETHEREUMSTORAGE */:
      return "ETHEREUMSTORAGE";
    case 4 /* ETHEREUMACCOUNT */:
      return "ETHEREUMACCOUNT";
    case 5 /* CA */:
      return "CA";
    case 6 /* FARCASTER_FRAME */:
      return "FARCASTER_FRAME";
    case -1 /* UNRECOGNIZED */:
    default:
      return "UNRECOGNIZED";
  }
}
var ProofCA_Type = /* @__PURE__ */ ((ProofCA_Type2) => {
  ProofCA_Type2[ProofCA_Type2["UNKNOWN"] = 0] = "UNKNOWN";
  ProofCA_Type2[ProofCA_Type2["ECDSA"] = 1] = "ECDSA";
  ProofCA_Type2[ProofCA_Type2["ECDSA_PIDSALTED"] = 2] = "ECDSA_PIDSALTED";
  ProofCA_Type2[ProofCA_Type2["ECDSA_BLIND"] = 3] = "ECDSA_BLIND";
  ProofCA_Type2[ProofCA_Type2["ECDSA_BLIND_PIDSALTED"] = 4] = "ECDSA_BLIND_PIDSALTED";
  ProofCA_Type2[ProofCA_Type2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
  return ProofCA_Type2;
})(ProofCA_Type || {});
function proofCA_TypeFromJSON(object) {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return 0 /* UNKNOWN */;
    case 1:
    case "ECDSA":
      return 1 /* ECDSA */;
    case 2:
    case "ECDSA_PIDSALTED":
      return 2 /* ECDSA_PIDSALTED */;
    case 3:
    case "ECDSA_BLIND":
      return 3 /* ECDSA_BLIND */;
    case 4:
    case "ECDSA_BLIND_PIDSALTED":
      return 4 /* ECDSA_BLIND_PIDSALTED */;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1 /* UNRECOGNIZED */;
  }
}
function proofCA_TypeToJSON(object) {
  switch (object) {
    case 0 /* UNKNOWN */:
      return "UNKNOWN";
    case 1 /* ECDSA */:
      return "ECDSA";
    case 2 /* ECDSA_PIDSALTED */:
      return "ECDSA_PIDSALTED";
    case 3 /* ECDSA_BLIND */:
      return "ECDSA_BLIND";
    case 4 /* ECDSA_BLIND_PIDSALTED */:
      return "ECDSA_BLIND_PIDSALTED";
    case -1 /* UNRECOGNIZED */:
    default:
      return "UNRECOGNIZED";
  }
}
var ProofArbo_Type = /* @__PURE__ */ ((ProofArbo_Type2) => {
  ProofArbo_Type2[ProofArbo_Type2["BLAKE2B"] = 0] = "BLAKE2B";
  ProofArbo_Type2[ProofArbo_Type2["POSEIDON"] = 1] = "POSEIDON";
  ProofArbo_Type2[ProofArbo_Type2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
  return ProofArbo_Type2;
})(ProofArbo_Type || {});
function proofArbo_TypeFromJSON(object) {
  switch (object) {
    case 0:
    case "BLAKE2B":
      return 0 /* BLAKE2B */;
    case 1:
    case "POSEIDON":
      return 1 /* POSEIDON */;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1 /* UNRECOGNIZED */;
  }
}
function proofArbo_TypeToJSON(object) {
  switch (object) {
    case 0 /* BLAKE2B */:
      return "BLAKE2B";
    case 1 /* POSEIDON */:
      return "POSEIDON";
    case -1 /* UNRECOGNIZED */:
    default:
      return "UNRECOGNIZED";
  }
}
var ProofArbo_KeyType = /* @__PURE__ */ ((ProofArbo_KeyType2) => {
  ProofArbo_KeyType2[ProofArbo_KeyType2["PUBKEY"] = 0] = "PUBKEY";
  ProofArbo_KeyType2[ProofArbo_KeyType2["ADDRESS"] = 1] = "ADDRESS";
  ProofArbo_KeyType2[ProofArbo_KeyType2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
  return ProofArbo_KeyType2;
})(ProofArbo_KeyType || {});
function proofArbo_KeyTypeFromJSON(object) {
  switch (object) {
    case 0:
    case "PUBKEY":
      return 0 /* PUBKEY */;
    case 1:
    case "ADDRESS":
      return 1 /* ADDRESS */;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1 /* UNRECOGNIZED */;
  }
}
function proofArbo_KeyTypeToJSON(object) {
  switch (object) {
    case 0 /* PUBKEY */:
      return "PUBKEY";
    case 1 /* ADDRESS */:
      return "ADDRESS";
    case -1 /* UNRECOGNIZED */:
    default:
      return "UNRECOGNIZED";
  }
}
function createBaseVoteEnvelope() {
  return {
    nonce: new Uint8Array(0),
    processId: new Uint8Array(0),
    proof: void 0,
    votePackage: new Uint8Array(0),
    nullifier: new Uint8Array(0),
    encryptionKeyIndexes: []
  };
}
var VoteEnvelope = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.nonce.length !== 0) {
      writer.uint32(10).bytes(message.nonce);
    }
    if (message.processId.length !== 0) {
      writer.uint32(18).bytes(message.processId);
    }
    if (message.proof !== void 0) {
      Proof.encode(message.proof, writer.uint32(26).fork()).ldelim();
    }
    if (message.votePackage.length !== 0) {
      writer.uint32(34).bytes(message.votePackage);
    }
    if (message.nullifier.length !== 0) {
      writer.uint32(42).bytes(message.nullifier);
    }
    writer.uint32(50).fork();
    for (const v of message.encryptionKeyIndexes) {
      writer.uint32(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVoteEnvelope();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.nonce = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.processId = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.proof = Proof.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.votePackage = reader.bytes();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.nullifier = reader.bytes();
          continue;
        case 6:
          if (tag === 48) {
            message.encryptionKeyIndexes.push(reader.uint32());
            continue;
          }
          if (tag === 50) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.encryptionKeyIndexes.push(reader.uint32());
            }
            continue;
          }
          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      nonce: isSet(object.nonce) ? bytesFromBase64(object.nonce) : new Uint8Array(0),
      processId: isSet(object.processId) ? bytesFromBase64(object.processId) : new Uint8Array(0),
      proof: isSet(object.proof) ? Proof.fromJSON(object.proof) : void 0,
      votePackage: isSet(object.votePackage) ? bytesFromBase64(object.votePackage) : new Uint8Array(0),
      nullifier: isSet(object.nullifier) ? bytesFromBase64(object.nullifier) : new Uint8Array(0),
      encryptionKeyIndexes: globalThis.Array.isArray(object?.encryptionKeyIndexes) ? object.encryptionKeyIndexes.map((e) => globalThis.Number(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.nonce.length !== 0) {
      obj.nonce = base64FromBytes(message.nonce);
    }
    if (message.processId.length !== 0) {
      obj.processId = base64FromBytes(message.processId);
    }
    if (message.proof !== void 0) {
      obj.proof = Proof.toJSON(message.proof);
    }
    if (message.votePackage.length !== 0) {
      obj.votePackage = base64FromBytes(message.votePackage);
    }
    if (message.nullifier.length !== 0) {
      obj.nullifier = base64FromBytes(message.nullifier);
    }
    if (message.encryptionKeyIndexes?.length) {
      obj.encryptionKeyIndexes = message.encryptionKeyIndexes.map((e) => Math.round(e));
    }
    return obj;
  },
  create(base) {
    return VoteEnvelope.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVoteEnvelope();
    message.nonce = object.nonce ?? new Uint8Array(0);
    message.processId = object.processId ?? new Uint8Array(0);
    message.proof = object.proof !== void 0 && object.proof !== null ? Proof.fromPartial(object.proof) : void 0;
    message.votePackage = object.votePackage ?? new Uint8Array(0);
    message.nullifier = object.nullifier ?? new Uint8Array(0);
    message.encryptionKeyIndexes = object.encryptionKeyIndexes?.map((e) => e) || [];
    return message;
  }
};
function createBaseCensus() {
  return {};
}
var Census = {
  encode(_, writer = import_minimal.default.Writer.create()) {
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseCensus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(_) {
    return {};
  },
  toJSON(_) {
    const obj = {};
    return obj;
  },
  create(base) {
    return Census.fromPartial(base ?? {});
  },
  fromPartial(_) {
    const message = createBaseCensus();
    return message;
  }
};
function createBaseProof() {
  return { payload: void 0 };
}
var Proof = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    switch (message.payload?.$case) {
      case "ethereumStorage":
        ProofEthereumStorage.encode(message.payload.ethereumStorage, writer.uint32(26).fork()).ldelim();
        break;
      case "ethereumAccount":
        ProofEthereumAccount.encode(message.payload.ethereumAccount, writer.uint32(34).fork()).ldelim();
        break;
      case "ca":
        ProofCA.encode(message.payload.ca, writer.uint32(42).fork()).ldelim();
        break;
      case "arbo":
        ProofArbo.encode(message.payload.arbo, writer.uint32(50).fork()).ldelim();
        break;
      case "zkSnark":
        ProofZkSNARK.encode(message.payload.zkSnark, writer.uint32(58).fork()).ldelim();
        break;
      case "minimeStorage":
        ProofMinime.encode(message.payload.minimeStorage, writer.uint32(66).fork()).ldelim();
        break;
      case "farcasterFrame":
        ProofFarcasterFrame.encode(message.payload.farcasterFrame, writer.uint32(74).fork()).ldelim();
        break;
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProof();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          if (tag !== 26) {
            break;
          }
          message.payload = {
            $case: "ethereumStorage",
            ethereumStorage: ProofEthereumStorage.decode(reader, reader.uint32())
          };
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.payload = {
            $case: "ethereumAccount",
            ethereumAccount: ProofEthereumAccount.decode(reader, reader.uint32())
          };
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.payload = { $case: "ca", ca: ProofCA.decode(reader, reader.uint32()) };
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.payload = { $case: "arbo", arbo: ProofArbo.decode(reader, reader.uint32()) };
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.payload = { $case: "zkSnark", zkSnark: ProofZkSNARK.decode(reader, reader.uint32()) };
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }
          message.payload = { $case: "minimeStorage", minimeStorage: ProofMinime.decode(reader, reader.uint32()) };
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.payload = {
            $case: "farcasterFrame",
            farcasterFrame: ProofFarcasterFrame.decode(reader, reader.uint32())
          };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      payload: isSet(object.ethereumStorage) ? { $case: "ethereumStorage", ethereumStorage: ProofEthereumStorage.fromJSON(object.ethereumStorage) } : isSet(object.ethereumAccount) ? { $case: "ethereumAccount", ethereumAccount: ProofEthereumAccount.fromJSON(object.ethereumAccount) } : isSet(object.ca) ? { $case: "ca", ca: ProofCA.fromJSON(object.ca) } : isSet(object.arbo) ? { $case: "arbo", arbo: ProofArbo.fromJSON(object.arbo) } : isSet(object.zkSnark) ? { $case: "zkSnark", zkSnark: ProofZkSNARK.fromJSON(object.zkSnark) } : isSet(object.minimeStorage) ? { $case: "minimeStorage", minimeStorage: ProofMinime.fromJSON(object.minimeStorage) } : isSet(object.farcasterFrame) ? { $case: "farcasterFrame", farcasterFrame: ProofFarcasterFrame.fromJSON(object.farcasterFrame) } : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.payload?.$case === "ethereumStorage") {
      obj.ethereumStorage = ProofEthereumStorage.toJSON(message.payload.ethereumStorage);
    }
    if (message.payload?.$case === "ethereumAccount") {
      obj.ethereumAccount = ProofEthereumAccount.toJSON(message.payload.ethereumAccount);
    }
    if (message.payload?.$case === "ca") {
      obj.ca = ProofCA.toJSON(message.payload.ca);
    }
    if (message.payload?.$case === "arbo") {
      obj.arbo = ProofArbo.toJSON(message.payload.arbo);
    }
    if (message.payload?.$case === "zkSnark") {
      obj.zkSnark = ProofZkSNARK.toJSON(message.payload.zkSnark);
    }
    if (message.payload?.$case === "minimeStorage") {
      obj.minimeStorage = ProofMinime.toJSON(message.payload.minimeStorage);
    }
    if (message.payload?.$case === "farcasterFrame") {
      obj.farcasterFrame = ProofFarcasterFrame.toJSON(message.payload.farcasterFrame);
    }
    return obj;
  },
  create(base) {
    return Proof.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProof();
    if (object.payload?.$case === "ethereumStorage" && object.payload?.ethereumStorage !== void 0 && object.payload?.ethereumStorage !== null) {
      message.payload = {
        $case: "ethereumStorage",
        ethereumStorage: ProofEthereumStorage.fromPartial(object.payload.ethereumStorage)
      };
    }
    if (object.payload?.$case === "ethereumAccount" && object.payload?.ethereumAccount !== void 0 && object.payload?.ethereumAccount !== null) {
      message.payload = {
        $case: "ethereumAccount",
        ethereumAccount: ProofEthereumAccount.fromPartial(object.payload.ethereumAccount)
      };
    }
    if (object.payload?.$case === "ca" && object.payload?.ca !== void 0 && object.payload?.ca !== null) {
      message.payload = { $case: "ca", ca: ProofCA.fromPartial(object.payload.ca) };
    }
    if (object.payload?.$case === "arbo" && object.payload?.arbo !== void 0 && object.payload?.arbo !== null) {
      message.payload = { $case: "arbo", arbo: ProofArbo.fromPartial(object.payload.arbo) };
    }
    if (object.payload?.$case === "zkSnark" && object.payload?.zkSnark !== void 0 && object.payload?.zkSnark !== null) {
      message.payload = { $case: "zkSnark", zkSnark: ProofZkSNARK.fromPartial(object.payload.zkSnark) };
    }
    if (object.payload?.$case === "minimeStorage" && object.payload?.minimeStorage !== void 0 && object.payload?.minimeStorage !== null) {
      message.payload = {
        $case: "minimeStorage",
        minimeStorage: ProofMinime.fromPartial(object.payload.minimeStorage)
      };
    }
    if (object.payload?.$case === "farcasterFrame" && object.payload?.farcasterFrame !== void 0 && object.payload?.farcasterFrame !== null) {
      message.payload = {
        $case: "farcasterFrame",
        farcasterFrame: ProofFarcasterFrame.fromPartial(object.payload.farcasterFrame)
      };
    }
    return message;
  }
};
function createBaseProofEthereumStorage() {
  return { key: new Uint8Array(0), value: new Uint8Array(0), siblings: [] };
}
var ProofEthereumStorage = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.key.length !== 0) {
      writer.uint32(10).bytes(message.key);
    }
    if (message.value.length !== 0) {
      writer.uint32(18).bytes(message.value);
    }
    for (const v of message.siblings) {
      writer.uint32(26).bytes(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProofEthereumStorage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.key = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.value = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.siblings.push(reader.bytes());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      key: isSet(object.key) ? bytesFromBase64(object.key) : new Uint8Array(0),
      value: isSet(object.value) ? bytesFromBase64(object.value) : new Uint8Array(0),
      siblings: globalThis.Array.isArray(object?.siblings) ? object.siblings.map((e) => bytesFromBase64(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.key.length !== 0) {
      obj.key = base64FromBytes(message.key);
    }
    if (message.value.length !== 0) {
      obj.value = base64FromBytes(message.value);
    }
    if (message.siblings?.length) {
      obj.siblings = message.siblings.map((e) => base64FromBytes(e));
    }
    return obj;
  },
  create(base) {
    return ProofEthereumStorage.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProofEthereumStorage();
    message.key = object.key ?? new Uint8Array(0);
    message.value = object.value ?? new Uint8Array(0);
    message.siblings = object.siblings?.map((e) => e) || [];
    return message;
  }
};
function createBaseProofEthereumAccount() {
  return {
    nonce: new Uint8Array(0),
    balance: new Uint8Array(0),
    storageHash: new Uint8Array(0),
    codeHash: new Uint8Array(0),
    siblings: []
  };
}
var ProofEthereumAccount = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.nonce.length !== 0) {
      writer.uint32(10).bytes(message.nonce);
    }
    if (message.balance.length !== 0) {
      writer.uint32(18).bytes(message.balance);
    }
    if (message.storageHash.length !== 0) {
      writer.uint32(26).bytes(message.storageHash);
    }
    if (message.codeHash.length !== 0) {
      writer.uint32(34).bytes(message.codeHash);
    }
    for (const v of message.siblings) {
      writer.uint32(42).bytes(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProofEthereumAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.nonce = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.balance = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.storageHash = reader.bytes();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.codeHash = reader.bytes();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.siblings.push(reader.bytes());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      nonce: isSet(object.nonce) ? bytesFromBase64(object.nonce) : new Uint8Array(0),
      balance: isSet(object.balance) ? bytesFromBase64(object.balance) : new Uint8Array(0),
      storageHash: isSet(object.storageHash) ? bytesFromBase64(object.storageHash) : new Uint8Array(0),
      codeHash: isSet(object.codeHash) ? bytesFromBase64(object.codeHash) : new Uint8Array(0),
      siblings: globalThis.Array.isArray(object?.siblings) ? object.siblings.map((e) => bytesFromBase64(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.nonce.length !== 0) {
      obj.nonce = base64FromBytes(message.nonce);
    }
    if (message.balance.length !== 0) {
      obj.balance = base64FromBytes(message.balance);
    }
    if (message.storageHash.length !== 0) {
      obj.storageHash = base64FromBytes(message.storageHash);
    }
    if (message.codeHash.length !== 0) {
      obj.codeHash = base64FromBytes(message.codeHash);
    }
    if (message.siblings?.length) {
      obj.siblings = message.siblings.map((e) => base64FromBytes(e));
    }
    return obj;
  },
  create(base) {
    return ProofEthereumAccount.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProofEthereumAccount();
    message.nonce = object.nonce ?? new Uint8Array(0);
    message.balance = object.balance ?? new Uint8Array(0);
    message.storageHash = object.storageHash ?? new Uint8Array(0);
    message.codeHash = object.codeHash ?? new Uint8Array(0);
    message.siblings = object.siblings?.map((e) => e) || [];
    return message;
  }
};
function createBaseProofMinime() {
  return { proofPrevBlock: void 0, proofNextBlock: void 0 };
}
var ProofMinime = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.proofPrevBlock !== void 0) {
      ProofEthereumStorage.encode(message.proofPrevBlock, writer.uint32(10).fork()).ldelim();
    }
    if (message.proofNextBlock !== void 0) {
      ProofEthereumStorage.encode(message.proofNextBlock, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProofMinime();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.proofPrevBlock = ProofEthereumStorage.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.proofNextBlock = ProofEthereumStorage.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      proofPrevBlock: isSet(object.proofPrevBlock) ? ProofEthereumStorage.fromJSON(object.proofPrevBlock) : void 0,
      proofNextBlock: isSet(object.proofNextBlock) ? ProofEthereumStorage.fromJSON(object.proofNextBlock) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.proofPrevBlock !== void 0) {
      obj.proofPrevBlock = ProofEthereumStorage.toJSON(message.proofPrevBlock);
    }
    if (message.proofNextBlock !== void 0) {
      obj.proofNextBlock = ProofEthereumStorage.toJSON(message.proofNextBlock);
    }
    return obj;
  },
  create(base) {
    return ProofMinime.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProofMinime();
    message.proofPrevBlock = object.proofPrevBlock !== void 0 && object.proofPrevBlock !== null ? ProofEthereumStorage.fromPartial(object.proofPrevBlock) : void 0;
    message.proofNextBlock = object.proofNextBlock !== void 0 && object.proofNextBlock !== null ? ProofEthereumStorage.fromPartial(object.proofNextBlock) : void 0;
    return message;
  }
};
function createBaseProofCA() {
  return { type: 0, bundle: void 0, signature: new Uint8Array(0) };
}
var ProofCA = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.bundle !== void 0) {
      CAbundle.encode(message.bundle, writer.uint32(18).fork()).ldelim();
    }
    if (message.signature.length !== 0) {
      writer.uint32(26).bytes(message.signature);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProofCA();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.type = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.bundle = CAbundle.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.signature = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      type: isSet(object.type) ? proofCA_TypeFromJSON(object.type) : 0,
      bundle: isSet(object.bundle) ? CAbundle.fromJSON(object.bundle) : void 0,
      signature: isSet(object.signature) ? bytesFromBase64(object.signature) : new Uint8Array(0)
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.type !== 0) {
      obj.type = proofCA_TypeToJSON(message.type);
    }
    if (message.bundle !== void 0) {
      obj.bundle = CAbundle.toJSON(message.bundle);
    }
    if (message.signature.length !== 0) {
      obj.signature = base64FromBytes(message.signature);
    }
    return obj;
  },
  create(base) {
    return ProofCA.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProofCA();
    message.type = object.type ?? 0;
    message.bundle = object.bundle !== void 0 && object.bundle !== null ? CAbundle.fromPartial(object.bundle) : void 0;
    message.signature = object.signature ?? new Uint8Array(0);
    return message;
  }
};
function createBaseCAbundle() {
  return { processId: new Uint8Array(0), address: new Uint8Array(0), voteWeight: void 0 };
}
var CAbundle = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.processId.length !== 0) {
      writer.uint32(10).bytes(message.processId);
    }
    if (message.address.length !== 0) {
      writer.uint32(18).bytes(message.address);
    }
    if (message.voteWeight !== void 0) {
      writer.uint32(26).bytes(message.voteWeight);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseCAbundle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.processId = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.address = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.voteWeight = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      processId: isSet(object.processId) ? bytesFromBase64(object.processId) : new Uint8Array(0),
      address: isSet(object.address) ? bytesFromBase64(object.address) : new Uint8Array(0),
      voteWeight: isSet(object.voteWeight) ? bytesFromBase64(object.voteWeight) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.processId.length !== 0) {
      obj.processId = base64FromBytes(message.processId);
    }
    if (message.address.length !== 0) {
      obj.address = base64FromBytes(message.address);
    }
    if (message.voteWeight !== void 0) {
      obj.voteWeight = base64FromBytes(message.voteWeight);
    }
    return obj;
  },
  create(base) {
    return CAbundle.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseCAbundle();
    message.processId = object.processId ?? new Uint8Array(0);
    message.address = object.address ?? new Uint8Array(0);
    message.voteWeight = object.voteWeight ?? void 0;
    return message;
  }
};
function createBaseProofArbo() {
  return {
    type: 0,
    siblings: new Uint8Array(0),
    availableWeight: new Uint8Array(0),
    keyType: 0,
    voteWeight: new Uint8Array(0)
  };
}
var ProofArbo = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.siblings.length !== 0) {
      writer.uint32(18).bytes(message.siblings);
    }
    if (message.availableWeight.length !== 0) {
      writer.uint32(26).bytes(message.availableWeight);
    }
    if (message.keyType !== 0) {
      writer.uint32(32).int32(message.keyType);
    }
    if (message.voteWeight.length !== 0) {
      writer.uint32(42).bytes(message.voteWeight);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProofArbo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.type = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.siblings = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.availableWeight = reader.bytes();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.keyType = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.voteWeight = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      type: isSet(object.type) ? proofArbo_TypeFromJSON(object.type) : 0,
      siblings: isSet(object.siblings) ? bytesFromBase64(object.siblings) : new Uint8Array(0),
      availableWeight: isSet(object.availableWeight) ? bytesFromBase64(object.availableWeight) : new Uint8Array(0),
      keyType: isSet(object.keyType) ? proofArbo_KeyTypeFromJSON(object.keyType) : 0,
      voteWeight: isSet(object.voteWeight) ? bytesFromBase64(object.voteWeight) : new Uint8Array(0)
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.type !== 0) {
      obj.type = proofArbo_TypeToJSON(message.type);
    }
    if (message.siblings.length !== 0) {
      obj.siblings = base64FromBytes(message.siblings);
    }
    if (message.availableWeight.length !== 0) {
      obj.availableWeight = base64FromBytes(message.availableWeight);
    }
    if (message.keyType !== 0) {
      obj.keyType = proofArbo_KeyTypeToJSON(message.keyType);
    }
    if (message.voteWeight.length !== 0) {
      obj.voteWeight = base64FromBytes(message.voteWeight);
    }
    return obj;
  },
  create(base) {
    return ProofArbo.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProofArbo();
    message.type = object.type ?? 0;
    message.siblings = object.siblings ?? new Uint8Array(0);
    message.availableWeight = object.availableWeight ?? new Uint8Array(0);
    message.keyType = object.keyType ?? 0;
    message.voteWeight = object.voteWeight ?? new Uint8Array(0);
    return message;
  }
};
function createBaseProofZkSNARK() {
  return { circuitParametersIndex: 0, a: [], b: [], c: [], publicInputs: [] };
}
var ProofZkSNARK = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.circuitParametersIndex !== 0) {
      writer.uint32(8).int32(message.circuitParametersIndex);
    }
    for (const v of message.a) {
      writer.uint32(18).string(v);
    }
    for (const v of message.b) {
      writer.uint32(26).string(v);
    }
    for (const v of message.c) {
      writer.uint32(34).string(v);
    }
    for (const v of message.publicInputs) {
      writer.uint32(42).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProofZkSNARK();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.circuitParametersIndex = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.a.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.b.push(reader.string());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.c.push(reader.string());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.publicInputs.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      circuitParametersIndex: isSet(object.circuitParametersIndex) ? globalThis.Number(object.circuitParametersIndex) : 0,
      a: globalThis.Array.isArray(object?.a) ? object.a.map((e) => globalThis.String(e)) : [],
      b: globalThis.Array.isArray(object?.b) ? object.b.map((e) => globalThis.String(e)) : [],
      c: globalThis.Array.isArray(object?.c) ? object.c.map((e) => globalThis.String(e)) : [],
      publicInputs: globalThis.Array.isArray(object?.publicInputs) ? object.publicInputs.map((e) => globalThis.String(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.circuitParametersIndex !== 0) {
      obj.circuitParametersIndex = Math.round(message.circuitParametersIndex);
    }
    if (message.a?.length) {
      obj.a = message.a;
    }
    if (message.b?.length) {
      obj.b = message.b;
    }
    if (message.c?.length) {
      obj.c = message.c;
    }
    if (message.publicInputs?.length) {
      obj.publicInputs = message.publicInputs;
    }
    return obj;
  },
  create(base) {
    return ProofZkSNARK.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProofZkSNARK();
    message.circuitParametersIndex = object.circuitParametersIndex ?? 0;
    message.a = object.a?.map((e) => e) || [];
    message.b = object.b?.map((e) => e) || [];
    message.c = object.c?.map((e) => e) || [];
    message.publicInputs = object.publicInputs?.map((e) => e) || [];
    return message;
  }
};
function createBaseProofFarcasterFrame() {
  return { signedFrameMessageBody: new Uint8Array(0), censusProof: void 0, publicKey: new Uint8Array(0) };
}
var ProofFarcasterFrame = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.signedFrameMessageBody.length !== 0) {
      writer.uint32(10).bytes(message.signedFrameMessageBody);
    }
    if (message.censusProof !== void 0) {
      ProofArbo.encode(message.censusProof, writer.uint32(18).fork()).ldelim();
    }
    if (message.publicKey.length !== 0) {
      writer.uint32(26).bytes(message.publicKey);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProofFarcasterFrame();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.signedFrameMessageBody = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.censusProof = ProofArbo.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.publicKey = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      signedFrameMessageBody: isSet(object.signedFrameMessageBody) ? bytesFromBase64(object.signedFrameMessageBody) : new Uint8Array(0),
      censusProof: isSet(object.censusProof) ? ProofArbo.fromJSON(object.censusProof) : void 0,
      publicKey: isSet(object.publicKey) ? bytesFromBase64(object.publicKey) : new Uint8Array(0)
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.signedFrameMessageBody.length !== 0) {
      obj.signedFrameMessageBody = base64FromBytes(message.signedFrameMessageBody);
    }
    if (message.censusProof !== void 0) {
      obj.censusProof = ProofArbo.toJSON(message.censusProof);
    }
    if (message.publicKey.length !== 0) {
      obj.publicKey = base64FromBytes(message.publicKey);
    }
    return obj;
  },
  create(base) {
    return ProofFarcasterFrame.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProofFarcasterFrame();
    message.signedFrameMessageBody = object.signedFrameMessageBody ?? new Uint8Array(0);
    message.censusProof = object.censusProof !== void 0 && object.censusProof !== null ? ProofArbo.fromPartial(object.censusProof) : void 0;
    message.publicKey = object.publicKey ?? new Uint8Array(0);
    return message;
  }
};
function createBaseAccount() {
  return { balance: 0, nonce: 0, infoURI: "", delegateAddrs: [], processIndex: 0 };
}
var Account = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.balance !== 0) {
      writer.uint32(8).uint64(message.balance);
    }
    if (message.nonce !== 0) {
      writer.uint32(16).uint32(message.nonce);
    }
    if (message.infoURI !== "") {
      writer.uint32(26).string(message.infoURI);
    }
    for (const v of message.delegateAddrs) {
      writer.uint32(34).bytes(v);
    }
    if (message.processIndex !== 0) {
      writer.uint32(40).uint32(message.processIndex);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.balance = longToNumber(reader.uint64());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.infoURI = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.delegateAddrs.push(reader.bytes());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }
          message.processIndex = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      balance: isSet(object.balance) ? globalThis.Number(object.balance) : 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : 0,
      infoURI: isSet(object.infoURI) ? globalThis.String(object.infoURI) : "",
      delegateAddrs: globalThis.Array.isArray(object?.delegateAddrs) ? object.delegateAddrs.map((e) => bytesFromBase64(e)) : [],
      processIndex: isSet(object.processIndex) ? globalThis.Number(object.processIndex) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.balance !== 0) {
      obj.balance = Math.round(message.balance);
    }
    if (message.nonce !== 0) {
      obj.nonce = Math.round(message.nonce);
    }
    if (message.infoURI !== "") {
      obj.infoURI = message.infoURI;
    }
    if (message.delegateAddrs?.length) {
      obj.delegateAddrs = message.delegateAddrs.map((e) => base64FromBytes(e));
    }
    if (message.processIndex !== 0) {
      obj.processIndex = Math.round(message.processIndex);
    }
    return obj;
  },
  create(base) {
    return Account.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseAccount();
    message.balance = object.balance ?? 0;
    message.nonce = object.nonce ?? 0;
    message.infoURI = object.infoURI ?? "";
    message.delegateAddrs = object.delegateAddrs?.map((e) => e) || [];
    message.processIndex = object.processIndex ?? 0;
    return message;
  }
};
function createBaseTx() {
  return { payload: void 0 };
}
var Tx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    switch (message.payload?.$case) {
      case "vote":
        VoteEnvelope.encode(message.payload.vote, writer.uint32(10).fork()).ldelim();
        break;
      case "newProcess":
        NewProcessTx.encode(message.payload.newProcess, writer.uint32(18).fork()).ldelim();
        break;
      case "admin":
        AdminTx.encode(message.payload.admin, writer.uint32(26).fork()).ldelim();
        break;
      case "setProcess":
        SetProcessTx.encode(message.payload.setProcess, writer.uint32(34).fork()).ldelim();
        break;
      case "registerKey":
        RegisterKeyTx.encode(message.payload.registerKey, writer.uint32(42).fork()).ldelim();
        break;
      case "sendTokens":
        SendTokensTx.encode(message.payload.sendTokens, writer.uint32(58).fork()).ldelim();
        break;
      case "setTransactionCosts":
        SetTransactionCostsTx.encode(message.payload.setTransactionCosts, writer.uint32(66).fork()).ldelim();
        break;
      case "setAccount":
        SetAccountTx.encode(message.payload.setAccount, writer.uint32(74).fork()).ldelim();
        break;
      case "collectFaucet":
        CollectFaucetTx.encode(message.payload.collectFaucet, writer.uint32(82).fork()).ldelim();
        break;
      case "setKeykeeper":
        SetKeykeeperTx.encode(message.payload.setKeykeeper, writer.uint32(90).fork()).ldelim();
        break;
      case "setSIK":
        SIKTx.encode(message.payload.setSIK, writer.uint32(98).fork()).ldelim();
        break;
      case "delSIK":
        SIKTx.encode(message.payload.delSIK, writer.uint32(106).fork()).ldelim();
        break;
      case "registerSIK":
        RegisterSIKTx.encode(message.payload.registerSIK, writer.uint32(114).fork()).ldelim();
        break;
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.payload = { $case: "vote", vote: VoteEnvelope.decode(reader, reader.uint32()) };
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.payload = { $case: "newProcess", newProcess: NewProcessTx.decode(reader, reader.uint32()) };
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.payload = { $case: "admin", admin: AdminTx.decode(reader, reader.uint32()) };
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.payload = { $case: "setProcess", setProcess: SetProcessTx.decode(reader, reader.uint32()) };
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.payload = { $case: "registerKey", registerKey: RegisterKeyTx.decode(reader, reader.uint32()) };
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.payload = { $case: "sendTokens", sendTokens: SendTokensTx.decode(reader, reader.uint32()) };
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }
          message.payload = {
            $case: "setTransactionCosts",
            setTransactionCosts: SetTransactionCostsTx.decode(reader, reader.uint32())
          };
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.payload = { $case: "setAccount", setAccount: SetAccountTx.decode(reader, reader.uint32()) };
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }
          message.payload = { $case: "collectFaucet", collectFaucet: CollectFaucetTx.decode(reader, reader.uint32()) };
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }
          message.payload = { $case: "setKeykeeper", setKeykeeper: SetKeykeeperTx.decode(reader, reader.uint32()) };
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }
          message.payload = { $case: "setSIK", setSIK: SIKTx.decode(reader, reader.uint32()) };
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }
          message.payload = { $case: "delSIK", delSIK: SIKTx.decode(reader, reader.uint32()) };
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }
          message.payload = { $case: "registerSIK", registerSIK: RegisterSIKTx.decode(reader, reader.uint32()) };
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      payload: isSet(object.vote) ? { $case: "vote", vote: VoteEnvelope.fromJSON(object.vote) } : isSet(object.newProcess) ? { $case: "newProcess", newProcess: NewProcessTx.fromJSON(object.newProcess) } : isSet(object.admin) ? { $case: "admin", admin: AdminTx.fromJSON(object.admin) } : isSet(object.setProcess) ? { $case: "setProcess", setProcess: SetProcessTx.fromJSON(object.setProcess) } : isSet(object.registerKey) ? { $case: "registerKey", registerKey: RegisterKeyTx.fromJSON(object.registerKey) } : isSet(object.sendTokens) ? { $case: "sendTokens", sendTokens: SendTokensTx.fromJSON(object.sendTokens) } : isSet(object.setTransactionCosts) ? {
        $case: "setTransactionCosts",
        setTransactionCosts: SetTransactionCostsTx.fromJSON(object.setTransactionCosts)
      } : isSet(object.setAccount) ? { $case: "setAccount", setAccount: SetAccountTx.fromJSON(object.setAccount) } : isSet(object.collectFaucet) ? { $case: "collectFaucet", collectFaucet: CollectFaucetTx.fromJSON(object.collectFaucet) } : isSet(object.setKeykeeper) ? { $case: "setKeykeeper", setKeykeeper: SetKeykeeperTx.fromJSON(object.setKeykeeper) } : isSet(object.setSIK) ? { $case: "setSIK", setSIK: SIKTx.fromJSON(object.setSIK) } : isSet(object.delSIK) ? { $case: "delSIK", delSIK: SIKTx.fromJSON(object.delSIK) } : isSet(object.registerSIK) ? { $case: "registerSIK", registerSIK: RegisterSIKTx.fromJSON(object.registerSIK) } : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.payload?.$case === "vote") {
      obj.vote = VoteEnvelope.toJSON(message.payload.vote);
    }
    if (message.payload?.$case === "newProcess") {
      obj.newProcess = NewProcessTx.toJSON(message.payload.newProcess);
    }
    if (message.payload?.$case === "admin") {
      obj.admin = AdminTx.toJSON(message.payload.admin);
    }
    if (message.payload?.$case === "setProcess") {
      obj.setProcess = SetProcessTx.toJSON(message.payload.setProcess);
    }
    if (message.payload?.$case === "registerKey") {
      obj.registerKey = RegisterKeyTx.toJSON(message.payload.registerKey);
    }
    if (message.payload?.$case === "sendTokens") {
      obj.sendTokens = SendTokensTx.toJSON(message.payload.sendTokens);
    }
    if (message.payload?.$case === "setTransactionCosts") {
      obj.setTransactionCosts = SetTransactionCostsTx.toJSON(message.payload.setTransactionCosts);
    }
    if (message.payload?.$case === "setAccount") {
      obj.setAccount = SetAccountTx.toJSON(message.payload.setAccount);
    }
    if (message.payload?.$case === "collectFaucet") {
      obj.collectFaucet = CollectFaucetTx.toJSON(message.payload.collectFaucet);
    }
    if (message.payload?.$case === "setKeykeeper") {
      obj.setKeykeeper = SetKeykeeperTx.toJSON(message.payload.setKeykeeper);
    }
    if (message.payload?.$case === "setSIK") {
      obj.setSIK = SIKTx.toJSON(message.payload.setSIK);
    }
    if (message.payload?.$case === "delSIK") {
      obj.delSIK = SIKTx.toJSON(message.payload.delSIK);
    }
    if (message.payload?.$case === "registerSIK") {
      obj.registerSIK = RegisterSIKTx.toJSON(message.payload.registerSIK);
    }
    return obj;
  },
  create(base) {
    return Tx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseTx();
    if (object.payload?.$case === "vote" && object.payload?.vote !== void 0 && object.payload?.vote !== null) {
      message.payload = { $case: "vote", vote: VoteEnvelope.fromPartial(object.payload.vote) };
    }
    if (object.payload?.$case === "newProcess" && object.payload?.newProcess !== void 0 && object.payload?.newProcess !== null) {
      message.payload = { $case: "newProcess", newProcess: NewProcessTx.fromPartial(object.payload.newProcess) };
    }
    if (object.payload?.$case === "admin" && object.payload?.admin !== void 0 && object.payload?.admin !== null) {
      message.payload = { $case: "admin", admin: AdminTx.fromPartial(object.payload.admin) };
    }
    if (object.payload?.$case === "setProcess" && object.payload?.setProcess !== void 0 && object.payload?.setProcess !== null) {
      message.payload = { $case: "setProcess", setProcess: SetProcessTx.fromPartial(object.payload.setProcess) };
    }
    if (object.payload?.$case === "registerKey" && object.payload?.registerKey !== void 0 && object.payload?.registerKey !== null) {
      message.payload = { $case: "registerKey", registerKey: RegisterKeyTx.fromPartial(object.payload.registerKey) };
    }
    if (object.payload?.$case === "sendTokens" && object.payload?.sendTokens !== void 0 && object.payload?.sendTokens !== null) {
      message.payload = { $case: "sendTokens", sendTokens: SendTokensTx.fromPartial(object.payload.sendTokens) };
    }
    if (object.payload?.$case === "setTransactionCosts" && object.payload?.setTransactionCosts !== void 0 && object.payload?.setTransactionCosts !== null) {
      message.payload = {
        $case: "setTransactionCosts",
        setTransactionCosts: SetTransactionCostsTx.fromPartial(object.payload.setTransactionCosts)
      };
    }
    if (object.payload?.$case === "setAccount" && object.payload?.setAccount !== void 0 && object.payload?.setAccount !== null) {
      message.payload = { $case: "setAccount", setAccount: SetAccountTx.fromPartial(object.payload.setAccount) };
    }
    if (object.payload?.$case === "collectFaucet" && object.payload?.collectFaucet !== void 0 && object.payload?.collectFaucet !== null) {
      message.payload = {
        $case: "collectFaucet",
        collectFaucet: CollectFaucetTx.fromPartial(object.payload.collectFaucet)
      };
    }
    if (object.payload?.$case === "setKeykeeper" && object.payload?.setKeykeeper !== void 0 && object.payload?.setKeykeeper !== null) {
      message.payload = {
        $case: "setKeykeeper",
        setKeykeeper: SetKeykeeperTx.fromPartial(object.payload.setKeykeeper)
      };
    }
    if (object.payload?.$case === "setSIK" && object.payload?.setSIK !== void 0 && object.payload?.setSIK !== null) {
      message.payload = { $case: "setSIK", setSIK: SIKTx.fromPartial(object.payload.setSIK) };
    }
    if (object.payload?.$case === "delSIK" && object.payload?.delSIK !== void 0 && object.payload?.delSIK !== null) {
      message.payload = { $case: "delSIK", delSIK: SIKTx.fromPartial(object.payload.delSIK) };
    }
    if (object.payload?.$case === "registerSIK" && object.payload?.registerSIK !== void 0 && object.payload?.registerSIK !== null) {
      message.payload = { $case: "registerSIK", registerSIK: RegisterSIKTx.fromPartial(object.payload.registerSIK) };
    }
    return message;
  }
};
function createBaseSignedTx() {
  return { tx: new Uint8Array(0), signature: void 0 };
}
var SignedTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.tx.length !== 0) {
      writer.uint32(10).bytes(message.tx);
    }
    if (message.signature !== void 0) {
      writer.uint32(18).bytes(message.signature);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSignedTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.tx = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.signature = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      tx: isSet(object.tx) ? bytesFromBase64(object.tx) : new Uint8Array(0),
      signature: isSet(object.signature) ? bytesFromBase64(object.signature) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.tx.length !== 0) {
      obj.tx = base64FromBytes(message.tx);
    }
    if (message.signature !== void 0) {
      obj.signature = base64FromBytes(message.signature);
    }
    return obj;
  },
  create(base) {
    return SignedTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSignedTx();
    message.tx = object.tx ?? new Uint8Array(0);
    message.signature = object.signature ?? void 0;
    return message;
  }
};
function createBaseNewProcessTx() {
  return { txtype: 0, nonce: 0, process: void 0, faucetPackage: void 0 };
}
var NewProcessTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.txtype !== 0) {
      writer.uint32(8).int32(message.txtype);
    }
    if (message.nonce !== 0) {
      writer.uint32(16).uint32(message.nonce);
    }
    if (message.process !== void 0) {
      Process.encode(message.process, writer.uint32(26).fork()).ldelim();
    }
    if (message.faucetPackage !== void 0) {
      FaucetPackage.encode(message.faucetPackage, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseNewProcessTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.txtype = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.process = Process.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.faucetPackage = FaucetPackage.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      txtype: isSet(object.txtype) ? txTypeFromJSON(object.txtype) : 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : 0,
      process: isSet(object.process) ? Process.fromJSON(object.process) : void 0,
      faucetPackage: isSet(object.faucetPackage) ? FaucetPackage.fromJSON(object.faucetPackage) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.txtype !== 0) {
      obj.txtype = txTypeToJSON(message.txtype);
    }
    if (message.nonce !== 0) {
      obj.nonce = Math.round(message.nonce);
    }
    if (message.process !== void 0) {
      obj.process = Process.toJSON(message.process);
    }
    if (message.faucetPackage !== void 0) {
      obj.faucetPackage = FaucetPackage.toJSON(message.faucetPackage);
    }
    return obj;
  },
  create(base) {
    return NewProcessTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseNewProcessTx();
    message.txtype = object.txtype ?? 0;
    message.nonce = object.nonce ?? 0;
    message.process = object.process !== void 0 && object.process !== null ? Process.fromPartial(object.process) : void 0;
    message.faucetPackage = object.faucetPackage !== void 0 && object.faucetPackage !== null ? FaucetPackage.fromPartial(object.faucetPackage) : void 0;
    return message;
  }
};
function createBaseSetProcessTx() {
  return {
    txtype: 0,
    nonce: 0,
    processId: new Uint8Array(0),
    status: void 0,
    questionIndex: void 0,
    censusRoot: void 0,
    censusURI: void 0,
    proof: void 0,
    results: void 0,
    tempSIKs: void 0,
    duration: void 0,
    censusSize: void 0,
    faucetPackage: void 0
  };
}
var SetProcessTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.txtype !== 0) {
      writer.uint32(8).int32(message.txtype);
    }
    if (message.nonce !== 0) {
      writer.uint32(16).uint32(message.nonce);
    }
    if (message.processId.length !== 0) {
      writer.uint32(26).bytes(message.processId);
    }
    if (message.status !== void 0) {
      writer.uint32(32).int32(message.status);
    }
    if (message.questionIndex !== void 0) {
      writer.uint32(40).uint32(message.questionIndex);
    }
    if (message.censusRoot !== void 0) {
      writer.uint32(50).bytes(message.censusRoot);
    }
    if (message.censusURI !== void 0) {
      writer.uint32(58).string(message.censusURI);
    }
    if (message.proof !== void 0) {
      Proof.encode(message.proof, writer.uint32(66).fork()).ldelim();
    }
    if (message.results !== void 0) {
      ProcessResult.encode(message.results, writer.uint32(74).fork()).ldelim();
    }
    if (message.tempSIKs !== void 0) {
      writer.uint32(80).bool(message.tempSIKs);
    }
    if (message.duration !== void 0) {
      writer.uint32(88).uint32(message.duration);
    }
    if (message.censusSize !== void 0) {
      writer.uint32(96).uint64(message.censusSize);
    }
    if (message.faucetPackage !== void 0) {
      FaucetPackage.encode(message.faucetPackage, writer.uint32(106).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSetProcessTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.txtype = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.processId = reader.bytes();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.status = reader.int32();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }
          message.questionIndex = reader.uint32();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.censusRoot = reader.bytes();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.censusURI = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }
          message.proof = Proof.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.results = ProcessResult.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }
          message.tempSIKs = reader.bool();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }
          message.duration = reader.uint32();
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }
          message.censusSize = longToNumber(reader.uint64());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }
          message.faucetPackage = FaucetPackage.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      txtype: isSet(object.txtype) ? txTypeFromJSON(object.txtype) : 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : 0,
      processId: isSet(object.processId) ? bytesFromBase64(object.processId) : new Uint8Array(0),
      status: isSet(object.status) ? processStatusFromJSON(object.status) : void 0,
      questionIndex: isSet(object.questionIndex) ? globalThis.Number(object.questionIndex) : void 0,
      censusRoot: isSet(object.censusRoot) ? bytesFromBase64(object.censusRoot) : void 0,
      censusURI: isSet(object.censusURI) ? globalThis.String(object.censusURI) : void 0,
      proof: isSet(object.proof) ? Proof.fromJSON(object.proof) : void 0,
      results: isSet(object.results) ? ProcessResult.fromJSON(object.results) : void 0,
      tempSIKs: isSet(object.tempSIKs) ? globalThis.Boolean(object.tempSIKs) : void 0,
      duration: isSet(object.duration) ? globalThis.Number(object.duration) : void 0,
      censusSize: isSet(object.censusSize) ? globalThis.Number(object.censusSize) : void 0,
      faucetPackage: isSet(object.faucetPackage) ? FaucetPackage.fromJSON(object.faucetPackage) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.txtype !== 0) {
      obj.txtype = txTypeToJSON(message.txtype);
    }
    if (message.nonce !== 0) {
      obj.nonce = Math.round(message.nonce);
    }
    if (message.processId.length !== 0) {
      obj.processId = base64FromBytes(message.processId);
    }
    if (message.status !== void 0) {
      obj.status = processStatusToJSON(message.status);
    }
    if (message.questionIndex !== void 0) {
      obj.questionIndex = Math.round(message.questionIndex);
    }
    if (message.censusRoot !== void 0) {
      obj.censusRoot = base64FromBytes(message.censusRoot);
    }
    if (message.censusURI !== void 0) {
      obj.censusURI = message.censusURI;
    }
    if (message.proof !== void 0) {
      obj.proof = Proof.toJSON(message.proof);
    }
    if (message.results !== void 0) {
      obj.results = ProcessResult.toJSON(message.results);
    }
    if (message.tempSIKs !== void 0) {
      obj.tempSIKs = message.tempSIKs;
    }
    if (message.duration !== void 0) {
      obj.duration = Math.round(message.duration);
    }
    if (message.censusSize !== void 0) {
      obj.censusSize = Math.round(message.censusSize);
    }
    if (message.faucetPackage !== void 0) {
      obj.faucetPackage = FaucetPackage.toJSON(message.faucetPackage);
    }
    return obj;
  },
  create(base) {
    return SetProcessTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSetProcessTx();
    message.txtype = object.txtype ?? 0;
    message.nonce = object.nonce ?? 0;
    message.processId = object.processId ?? new Uint8Array(0);
    message.status = object.status ?? void 0;
    message.questionIndex = object.questionIndex ?? void 0;
    message.censusRoot = object.censusRoot ?? void 0;
    message.censusURI = object.censusURI ?? void 0;
    message.proof = object.proof !== void 0 && object.proof !== null ? Proof.fromPartial(object.proof) : void 0;
    message.results = object.results !== void 0 && object.results !== null ? ProcessResult.fromPartial(object.results) : void 0;
    message.tempSIKs = object.tempSIKs ?? void 0;
    message.duration = object.duration ?? void 0;
    message.censusSize = object.censusSize ?? void 0;
    message.faucetPackage = object.faucetPackage !== void 0 && object.faucetPackage !== null ? FaucetPackage.fromPartial(object.faucetPackage) : void 0;
    return message;
  }
};
function createBaseAdminTx() {
  return {
    txtype: 0,
    processId: new Uint8Array(0),
    address: void 0,
    encryptionPrivateKey: void 0,
    encryptionPublicKey: void 0,
    keyIndex: void 0,
    power: void 0,
    publicKey: void 0,
    nonce: 0
  };
}
var AdminTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.txtype !== 0) {
      writer.uint32(8).int32(message.txtype);
    }
    if (message.processId.length !== 0) {
      writer.uint32(18).bytes(message.processId);
    }
    if (message.address !== void 0) {
      writer.uint32(26).bytes(message.address);
    }
    if (message.encryptionPrivateKey !== void 0) {
      writer.uint32(42).bytes(message.encryptionPrivateKey);
    }
    if (message.encryptionPublicKey !== void 0) {
      writer.uint32(50).bytes(message.encryptionPublicKey);
    }
    if (message.keyIndex !== void 0) {
      writer.uint32(56).uint32(message.keyIndex);
    }
    if (message.power !== void 0) {
      writer.uint32(64).uint64(message.power);
    }
    if (message.publicKey !== void 0) {
      writer.uint32(74).bytes(message.publicKey);
    }
    if (message.nonce !== 0) {
      writer.uint32(88).uint32(message.nonce);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseAdminTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.txtype = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.processId = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.address = reader.bytes();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.encryptionPrivateKey = reader.bytes();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.encryptionPublicKey = reader.bytes();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }
          message.keyIndex = reader.uint32();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }
          message.power = longToNumber(reader.uint64());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.publicKey = reader.bytes();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      txtype: isSet(object.txtype) ? txTypeFromJSON(object.txtype) : 0,
      processId: isSet(object.processId) ? bytesFromBase64(object.processId) : new Uint8Array(0),
      address: isSet(object.address) ? bytesFromBase64(object.address) : void 0,
      encryptionPrivateKey: isSet(object.encryptionPrivateKey) ? bytesFromBase64(object.encryptionPrivateKey) : void 0,
      encryptionPublicKey: isSet(object.encryptionPublicKey) ? bytesFromBase64(object.encryptionPublicKey) : void 0,
      keyIndex: isSet(object.keyIndex) ? globalThis.Number(object.keyIndex) : void 0,
      power: isSet(object.power) ? globalThis.Number(object.power) : void 0,
      publicKey: isSet(object.publicKey) ? bytesFromBase64(object.publicKey) : void 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.txtype !== 0) {
      obj.txtype = txTypeToJSON(message.txtype);
    }
    if (message.processId.length !== 0) {
      obj.processId = base64FromBytes(message.processId);
    }
    if (message.address !== void 0) {
      obj.address = base64FromBytes(message.address);
    }
    if (message.encryptionPrivateKey !== void 0) {
      obj.encryptionPrivateKey = base64FromBytes(message.encryptionPrivateKey);
    }
    if (message.encryptionPublicKey !== void 0) {
      obj.encryptionPublicKey = base64FromBytes(message.encryptionPublicKey);
    }
    if (message.keyIndex !== void 0) {
      obj.keyIndex = Math.round(message.keyIndex);
    }
    if (message.power !== void 0) {
      obj.power = Math.round(message.power);
    }
    if (message.publicKey !== void 0) {
      obj.publicKey = base64FromBytes(message.publicKey);
    }
    if (message.nonce !== 0) {
      obj.nonce = Math.round(message.nonce);
    }
    return obj;
  },
  create(base) {
    return AdminTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseAdminTx();
    message.txtype = object.txtype ?? 0;
    message.processId = object.processId ?? new Uint8Array(0);
    message.address = object.address ?? void 0;
    message.encryptionPrivateKey = object.encryptionPrivateKey ?? void 0;
    message.encryptionPublicKey = object.encryptionPublicKey ?? void 0;
    message.keyIndex = object.keyIndex ?? void 0;
    message.power = object.power ?? void 0;
    message.publicKey = object.publicKey ?? void 0;
    message.nonce = object.nonce ?? 0;
    return message;
  }
};
function createBaseRegisterKeyTx() {
  return { nonce: 0, processId: new Uint8Array(0), proof: void 0, newKey: new Uint8Array(0), weight: "" };
}
var RegisterKeyTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.nonce !== 0) {
      writer.uint32(8).uint32(message.nonce);
    }
    if (message.processId.length !== 0) {
      writer.uint32(18).bytes(message.processId);
    }
    if (message.proof !== void 0) {
      Proof.encode(message.proof, writer.uint32(26).fork()).ldelim();
    }
    if (message.newKey.length !== 0) {
      writer.uint32(34).bytes(message.newKey);
    }
    if (message.weight !== "") {
      writer.uint32(42).string(message.weight);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseRegisterKeyTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.processId = reader.bytes();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.proof = Proof.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.newKey = reader.bytes();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.weight = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : 0,
      processId: isSet(object.processId) ? bytesFromBase64(object.processId) : new Uint8Array(0),
      proof: isSet(object.proof) ? Proof.fromJSON(object.proof) : void 0,
      newKey: isSet(object.newKey) ? bytesFromBase64(object.newKey) : new Uint8Array(0),
      weight: isSet(object.weight) ? globalThis.String(object.weight) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.nonce !== 0) {
      obj.nonce = Math.round(message.nonce);
    }
    if (message.processId.length !== 0) {
      obj.processId = base64FromBytes(message.processId);
    }
    if (message.proof !== void 0) {
      obj.proof = Proof.toJSON(message.proof);
    }
    if (message.newKey.length !== 0) {
      obj.newKey = base64FromBytes(message.newKey);
    }
    if (message.weight !== "") {
      obj.weight = message.weight;
    }
    return obj;
  },
  create(base) {
    return RegisterKeyTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseRegisterKeyTx();
    message.nonce = object.nonce ?? 0;
    message.processId = object.processId ?? new Uint8Array(0);
    message.proof = object.proof !== void 0 && object.proof !== null ? Proof.fromPartial(object.proof) : void 0;
    message.newKey = object.newKey ?? new Uint8Array(0);
    message.weight = object.weight ?? "";
    return message;
  }
};
function createBaseSendTokensTx() {
  return { txtype: 0, nonce: 0, from: new Uint8Array(0), to: new Uint8Array(0), value: 0 };
}
var SendTokensTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.txtype !== 0) {
      writer.uint32(8).int32(message.txtype);
    }
    if (message.nonce !== 0) {
      writer.uint32(16).uint32(message.nonce);
    }
    if (message.from.length !== 0) {
      writer.uint32(26).bytes(message.from);
    }
    if (message.to.length !== 0) {
      writer.uint32(34).bytes(message.to);
    }
    if (message.value !== 0) {
      writer.uint32(40).uint64(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSendTokensTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.txtype = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.from = reader.bytes();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.to = reader.bytes();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }
          message.value = longToNumber(reader.uint64());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      txtype: isSet(object.txtype) ? txTypeFromJSON(object.txtype) : 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : 0,
      from: isSet(object.from) ? bytesFromBase64(object.from) : new Uint8Array(0),
      to: isSet(object.to) ? bytesFromBase64(object.to) : new Uint8Array(0),
      value: isSet(object.value) ? globalThis.Number(object.value) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.txtype !== 0) {
      obj.txtype = txTypeToJSON(message.txtype);
    }
    if (message.nonce !== 0) {
      obj.nonce = Math.round(message.nonce);
    }
    if (message.from.length !== 0) {
      obj.from = base64FromBytes(message.from);
    }
    if (message.to.length !== 0) {
      obj.to = base64FromBytes(message.to);
    }
    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }
    return obj;
  },
  create(base) {
    return SendTokensTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSendTokensTx();
    message.txtype = object.txtype ?? 0;
    message.nonce = object.nonce ?? 0;
    message.from = object.from ?? new Uint8Array(0);
    message.to = object.to ?? new Uint8Array(0);
    message.value = object.value ?? 0;
    return message;
  }
};
function createBaseSetTransactionCostsTx() {
  return { txtype: 0, nonce: 0, value: 0 };
}
var SetTransactionCostsTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.txtype !== 0) {
      writer.uint32(8).int32(message.txtype);
    }
    if (message.nonce !== 0) {
      writer.uint32(16).uint32(message.nonce);
    }
    if (message.value !== 0) {
      writer.uint32(24).uint64(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSetTransactionCostsTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.txtype = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.value = longToNumber(reader.uint64());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      txtype: isSet(object.txtype) ? txTypeFromJSON(object.txtype) : 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : 0,
      value: isSet(object.value) ? globalThis.Number(object.value) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.txtype !== 0) {
      obj.txtype = txTypeToJSON(message.txtype);
    }
    if (message.nonce !== 0) {
      obj.nonce = Math.round(message.nonce);
    }
    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }
    return obj;
  },
  create(base) {
    return SetTransactionCostsTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSetTransactionCostsTx();
    message.txtype = object.txtype ?? 0;
    message.nonce = object.nonce ?? 0;
    message.value = object.value ?? 0;
    return message;
  }
};
function createBaseSetAccountTx() {
  return {
    txtype: 0,
    nonce: void 0,
    infoURI: void 0,
    account: void 0,
    faucetPackage: void 0,
    delegates: [],
    SIK: void 0,
    publicKey: void 0,
    name: void 0
  };
}
var SetAccountTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.txtype !== 0) {
      writer.uint32(8).int32(message.txtype);
    }
    if (message.nonce !== void 0) {
      writer.uint32(16).uint32(message.nonce);
    }
    if (message.infoURI !== void 0) {
      writer.uint32(26).string(message.infoURI);
    }
    if (message.account !== void 0) {
      writer.uint32(34).bytes(message.account);
    }
    if (message.faucetPackage !== void 0) {
      FaucetPackage.encode(message.faucetPackage, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.delegates) {
      writer.uint32(50).bytes(v);
    }
    if (message.SIK !== void 0) {
      writer.uint32(58).bytes(message.SIK);
    }
    if (message.publicKey !== void 0) {
      writer.uint32(66).bytes(message.publicKey);
    }
    if (message.name !== void 0) {
      writer.uint32(74).string(message.name);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSetAccountTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.txtype = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.infoURI = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.account = reader.bytes();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.faucetPackage = FaucetPackage.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.delegates.push(reader.bytes());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.SIK = reader.bytes();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }
          message.publicKey = reader.bytes();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      txtype: isSet(object.txtype) ? txTypeFromJSON(object.txtype) : 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : void 0,
      infoURI: isSet(object.infoURI) ? globalThis.String(object.infoURI) : void 0,
      account: isSet(object.account) ? bytesFromBase64(object.account) : void 0,
      faucetPackage: isSet(object.faucetPackage) ? FaucetPackage.fromJSON(object.faucetPackage) : void 0,
      delegates: globalThis.Array.isArray(object?.delegates) ? object.delegates.map((e) => bytesFromBase64(e)) : [],
      SIK: isSet(object.SIK) ? bytesFromBase64(object.SIK) : void 0,
      publicKey: isSet(object.publicKey) ? bytesFromBase64(object.publicKey) : void 0,
      name: isSet(object.name) ? globalThis.String(object.name) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.txtype !== 0) {
      obj.txtype = txTypeToJSON(message.txtype);
    }
    if (message.nonce !== void 0) {
      obj.nonce = Math.round(message.nonce);
    }
    if (message.infoURI !== void 0) {
      obj.infoURI = message.infoURI;
    }
    if (message.account !== void 0) {
      obj.account = base64FromBytes(message.account);
    }
    if (message.faucetPackage !== void 0) {
      obj.faucetPackage = FaucetPackage.toJSON(message.faucetPackage);
    }
    if (message.delegates?.length) {
      obj.delegates = message.delegates.map((e) => base64FromBytes(e));
    }
    if (message.SIK !== void 0) {
      obj.SIK = base64FromBytes(message.SIK);
    }
    if (message.publicKey !== void 0) {
      obj.publicKey = base64FromBytes(message.publicKey);
    }
    if (message.name !== void 0) {
      obj.name = message.name;
    }
    return obj;
  },
  create(base) {
    return SetAccountTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSetAccountTx();
    message.txtype = object.txtype ?? 0;
    message.nonce = object.nonce ?? void 0;
    message.infoURI = object.infoURI ?? void 0;
    message.account = object.account ?? void 0;
    message.faucetPackage = object.faucetPackage !== void 0 && object.faucetPackage !== null ? FaucetPackage.fromPartial(object.faucetPackage) : void 0;
    message.delegates = object.delegates?.map((e) => e) || [];
    message.SIK = object.SIK ?? void 0;
    message.publicKey = object.publicKey ?? void 0;
    message.name = object.name ?? void 0;
    return message;
  }
};
function createBaseSIKTx() {
  return { txtype: 0, nonce: void 0, SIK: void 0, faucetPackage: void 0 };
}
var SIKTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.txtype !== 0) {
      writer.uint32(8).int32(message.txtype);
    }
    if (message.nonce !== void 0) {
      writer.uint32(16).uint32(message.nonce);
    }
    if (message.SIK !== void 0) {
      writer.uint32(26).bytes(message.SIK);
    }
    if (message.faucetPackage !== void 0) {
      FaucetPackage.encode(message.faucetPackage, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSIKTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.txtype = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.SIK = reader.bytes();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.faucetPackage = FaucetPackage.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      txtype: isSet(object.txtype) ? txTypeFromJSON(object.txtype) : 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : void 0,
      SIK: isSet(object.SIK) ? bytesFromBase64(object.SIK) : void 0,
      faucetPackage: isSet(object.faucetPackage) ? FaucetPackage.fromJSON(object.faucetPackage) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.txtype !== 0) {
      obj.txtype = txTypeToJSON(message.txtype);
    }
    if (message.nonce !== void 0) {
      obj.nonce = Math.round(message.nonce);
    }
    if (message.SIK !== void 0) {
      obj.SIK = base64FromBytes(message.SIK);
    }
    if (message.faucetPackage !== void 0) {
      obj.faucetPackage = FaucetPackage.toJSON(message.faucetPackage);
    }
    return obj;
  },
  create(base) {
    return SIKTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSIKTx();
    message.txtype = object.txtype ?? 0;
    message.nonce = object.nonce ?? void 0;
    message.SIK = object.SIK ?? void 0;
    message.faucetPackage = object.faucetPackage !== void 0 && object.faucetPackage !== null ? FaucetPackage.fromPartial(object.faucetPackage) : void 0;
    return message;
  }
};
function createBaseRegisterSIKTx() {
  return { electionId: new Uint8Array(0), censusProof: void 0, SIK: new Uint8Array(0) };
}
var RegisterSIKTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.electionId.length !== 0) {
      writer.uint32(10).bytes(message.electionId);
    }
    if (message.censusProof !== void 0) {
      Proof.encode(message.censusProof, writer.uint32(18).fork()).ldelim();
    }
    if (message.SIK.length !== 0) {
      writer.uint32(26).bytes(message.SIK);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseRegisterSIKTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.electionId = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.censusProof = Proof.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.SIK = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      electionId: isSet(object.electionId) ? bytesFromBase64(object.electionId) : new Uint8Array(0),
      censusProof: isSet(object.censusProof) ? Proof.fromJSON(object.censusProof) : void 0,
      SIK: isSet(object.SIK) ? bytesFromBase64(object.SIK) : new Uint8Array(0)
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.electionId.length !== 0) {
      obj.electionId = base64FromBytes(message.electionId);
    }
    if (message.censusProof !== void 0) {
      obj.censusProof = Proof.toJSON(message.censusProof);
    }
    if (message.SIK.length !== 0) {
      obj.SIK = base64FromBytes(message.SIK);
    }
    return obj;
  },
  create(base) {
    return RegisterSIKTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseRegisterSIKTx();
    message.electionId = object.electionId ?? new Uint8Array(0);
    message.censusProof = object.censusProof !== void 0 && object.censusProof !== null ? Proof.fromPartial(object.censusProof) : void 0;
    message.SIK = object.SIK ?? new Uint8Array(0);
    return message;
  }
};
function createBaseCollectFaucetTx() {
  return { txType: 0, faucetPackage: void 0, nonce: 0 };
}
var CollectFaucetTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.txType !== 0) {
      writer.uint32(8).int32(message.txType);
    }
    if (message.faucetPackage !== void 0) {
      FaucetPackage.encode(message.faucetPackage, writer.uint32(18).fork()).ldelim();
    }
    if (message.nonce !== 0) {
      writer.uint32(24).uint32(message.nonce);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseCollectFaucetTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.txType = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.faucetPackage = FaucetPackage.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      txType: isSet(object.txType) ? txTypeFromJSON(object.txType) : 0,
      faucetPackage: isSet(object.faucetPackage) ? FaucetPackage.fromJSON(object.faucetPackage) : void 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.txType !== 0) {
      obj.txType = txTypeToJSON(message.txType);
    }
    if (message.faucetPackage !== void 0) {
      obj.faucetPackage = FaucetPackage.toJSON(message.faucetPackage);
    }
    if (message.nonce !== 0) {
      obj.nonce = Math.round(message.nonce);
    }
    return obj;
  },
  create(base) {
    return CollectFaucetTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseCollectFaucetTx();
    message.txType = object.txType ?? 0;
    message.faucetPackage = object.faucetPackage !== void 0 && object.faucetPackage !== null ? FaucetPackage.fromPartial(object.faucetPackage) : void 0;
    message.nonce = object.nonce ?? 0;
    return message;
  }
};
function createBaseFaucetPayload() {
  return { identifier: 0, to: new Uint8Array(0), amount: 0 };
}
var FaucetPayload = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.identifier !== 0) {
      writer.uint32(8).uint64(message.identifier);
    }
    if (message.to.length !== 0) {
      writer.uint32(18).bytes(message.to);
    }
    if (message.amount !== 0) {
      writer.uint32(24).uint64(message.amount);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFaucetPayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.identifier = longToNumber(reader.uint64());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.to = reader.bytes();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.amount = longToNumber(reader.uint64());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      identifier: isSet(object.identifier) ? globalThis.Number(object.identifier) : 0,
      to: isSet(object.to) ? bytesFromBase64(object.to) : new Uint8Array(0),
      amount: isSet(object.amount) ? globalThis.Number(object.amount) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.identifier !== 0) {
      obj.identifier = Math.round(message.identifier);
    }
    if (message.to.length !== 0) {
      obj.to = base64FromBytes(message.to);
    }
    if (message.amount !== 0) {
      obj.amount = Math.round(message.amount);
    }
    return obj;
  },
  create(base) {
    return FaucetPayload.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFaucetPayload();
    message.identifier = object.identifier ?? 0;
    message.to = object.to ?? new Uint8Array(0);
    message.amount = object.amount ?? 0;
    return message;
  }
};
function createBaseFaucetPackage() {
  return { payload: new Uint8Array(0), signature: new Uint8Array(0) };
}
var FaucetPackage = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.payload.length !== 0) {
      writer.uint32(10).bytes(message.payload);
    }
    if (message.signature.length !== 0) {
      writer.uint32(18).bytes(message.signature);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFaucetPackage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.payload = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.signature = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      payload: isSet(object.payload) ? bytesFromBase64(object.payload) : new Uint8Array(0),
      signature: isSet(object.signature) ? bytesFromBase64(object.signature) : new Uint8Array(0)
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.payload.length !== 0) {
      obj.payload = base64FromBytes(message.payload);
    }
    if (message.signature.length !== 0) {
      obj.signature = base64FromBytes(message.signature);
    }
    return obj;
  },
  create(base) {
    return FaucetPackage.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFaucetPackage();
    message.payload = object.payload ?? new Uint8Array(0);
    message.signature = object.signature ?? new Uint8Array(0);
    return message;
  }
};
function createBaseSetKeykeeperTx() {
  return { txtype: 0, nonce: 0, keykeeper: new Uint8Array(0) };
}
var SetKeykeeperTx = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.txtype !== 0) {
      writer.uint32(8).int32(message.txtype);
    }
    if (message.nonce !== 0) {
      writer.uint32(16).uint32(message.nonce);
    }
    if (message.keykeeper.length !== 0) {
      writer.uint32(26).bytes(message.keykeeper);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSetKeykeeperTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.txtype = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.nonce = reader.uint32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.keykeeper = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      txtype: isSet(object.txtype) ? txTypeFromJSON(object.txtype) : 0,
      nonce: isSet(object.nonce) ? globalThis.Number(object.nonce) : 0,
      keykeeper: isSet(object.keykeeper) ? bytesFromBase64(object.keykeeper) : new Uint8Array(0)
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.txtype !== 0) {
      obj.txtype = txTypeToJSON(message.txtype);
    }
    if (message.nonce !== 0) {
      obj.nonce = Math.round(message.nonce);
    }
    if (message.keykeeper.length !== 0) {
      obj.keykeeper = base64FromBytes(message.keykeeper);
    }
    return obj;
  },
  create(base) {
    return SetKeykeeperTx.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSetKeykeeperTx();
    message.txtype = object.txtype ?? 0;
    message.nonce = object.nonce ?? 0;
    message.keykeeper = object.keykeeper ?? new Uint8Array(0);
    return message;
  }
};
function createBaseProcess() {
  return {
    processId: new Uint8Array(0),
    entityId: new Uint8Array(0),
    startBlock: 0,
    blockCount: 0,
    censusRoot: new Uint8Array(0),
    censusURI: void 0,
    encryptionPrivateKeys: [],
    encryptionPublicKeys: [],
    keyIndex: void 0,
    status: 0,
    paramsSignature: void 0,
    namespace: 0,
    envelopeType: void 0,
    mode: void 0,
    questionIndex: void 0,
    questionCount: void 0,
    voteOptions: void 0,
    censusOrigin: 0,
    results: void 0,
    ethIndexSlot: void 0,
    sourceBlockHeight: void 0,
    owner: void 0,
    metadata: void 0,
    sourceNetworkId: 0,
    maxCensusSize: 0,
    rollingCensusRoot: void 0,
    rollingCensusSize: void 0,
    nullifiersRoot: void 0,
    sourceNetworkContractAddr: void 0,
    tokenDecimals: void 0,
    tempSIKs: void 0,
    startTime: 0,
    duration: 0
  };
}
var Process = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.processId.length !== 0) {
      writer.uint32(10).bytes(message.processId);
    }
    if (message.entityId.length !== 0) {
      writer.uint32(18).bytes(message.entityId);
    }
    if (message.startBlock !== 0) {
      writer.uint32(24).uint32(message.startBlock);
    }
    if (message.blockCount !== 0) {
      writer.uint32(32).uint32(message.blockCount);
    }
    if (message.censusRoot.length !== 0) {
      writer.uint32(42).bytes(message.censusRoot);
    }
    if (message.censusURI !== void 0) {
      writer.uint32(50).string(message.censusURI);
    }
    for (const v of message.encryptionPrivateKeys) {
      writer.uint32(66).string(v);
    }
    for (const v of message.encryptionPublicKeys) {
      writer.uint32(74).string(v);
    }
    if (message.keyIndex !== void 0) {
      writer.uint32(88).uint32(message.keyIndex);
    }
    if (message.status !== 0) {
      writer.uint32(96).int32(message.status);
    }
    if (message.paramsSignature !== void 0) {
      writer.uint32(106).bytes(message.paramsSignature);
    }
    if (message.namespace !== 0) {
      writer.uint32(112).uint32(message.namespace);
    }
    if (message.envelopeType !== void 0) {
      EnvelopeType.encode(message.envelopeType, writer.uint32(122).fork()).ldelim();
    }
    if (message.mode !== void 0) {
      ProcessMode.encode(message.mode, writer.uint32(130).fork()).ldelim();
    }
    if (message.questionIndex !== void 0) {
      writer.uint32(136).uint32(message.questionIndex);
    }
    if (message.questionCount !== void 0) {
      writer.uint32(144).uint32(message.questionCount);
    }
    if (message.voteOptions !== void 0) {
      ProcessVoteOptions.encode(message.voteOptions, writer.uint32(154).fork()).ldelim();
    }
    if (message.censusOrigin !== 0) {
      writer.uint32(160).int32(message.censusOrigin);
    }
    if (message.results !== void 0) {
      ProcessResult.encode(message.results, writer.uint32(170).fork()).ldelim();
    }
    if (message.ethIndexSlot !== void 0) {
      writer.uint32(184).uint32(message.ethIndexSlot);
    }
    if (message.sourceBlockHeight !== void 0) {
      writer.uint32(192).uint64(message.sourceBlockHeight);
    }
    if (message.owner !== void 0) {
      writer.uint32(202).bytes(message.owner);
    }
    if (message.metadata !== void 0) {
      writer.uint32(210).string(message.metadata);
    }
    if (message.sourceNetworkId !== 0) {
      writer.uint32(216).int32(message.sourceNetworkId);
    }
    if (message.maxCensusSize !== 0) {
      writer.uint32(224).uint64(message.maxCensusSize);
    }
    if (message.rollingCensusRoot !== void 0) {
      writer.uint32(234).bytes(message.rollingCensusRoot);
    }
    if (message.rollingCensusSize !== void 0) {
      writer.uint32(240).uint64(message.rollingCensusSize);
    }
    if (message.nullifiersRoot !== void 0) {
      writer.uint32(250).bytes(message.nullifiersRoot);
    }
    if (message.sourceNetworkContractAddr !== void 0) {
      writer.uint32(258).bytes(message.sourceNetworkContractAddr);
    }
    if (message.tokenDecimals !== void 0) {
      writer.uint32(264).uint32(message.tokenDecimals);
    }
    if (message.tempSIKs !== void 0) {
      writer.uint32(272).bool(message.tempSIKs);
    }
    if (message.startTime !== 0) {
      writer.uint32(280).uint32(message.startTime);
    }
    if (message.duration !== 0) {
      writer.uint32(288).uint32(message.duration);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProcess();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.processId = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.entityId = reader.bytes();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.startBlock = reader.uint32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.blockCount = reader.uint32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.censusRoot = reader.bytes();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.censusURI = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }
          message.encryptionPrivateKeys.push(reader.string());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.encryptionPublicKeys.push(reader.string());
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }
          message.keyIndex = reader.uint32();
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }
          message.status = reader.int32();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }
          message.paramsSignature = reader.bytes();
          continue;
        case 14:
          if (tag !== 112) {
            break;
          }
          message.namespace = reader.uint32();
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }
          message.envelopeType = EnvelopeType.decode(reader, reader.uint32());
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }
          message.mode = ProcessMode.decode(reader, reader.uint32());
          continue;
        case 17:
          if (tag !== 136) {
            break;
          }
          message.questionIndex = reader.uint32();
          continue;
        case 18:
          if (tag !== 144) {
            break;
          }
          message.questionCount = reader.uint32();
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }
          message.voteOptions = ProcessVoteOptions.decode(reader, reader.uint32());
          continue;
        case 20:
          if (tag !== 160) {
            break;
          }
          message.censusOrigin = reader.int32();
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }
          message.results = ProcessResult.decode(reader, reader.uint32());
          continue;
        case 23:
          if (tag !== 184) {
            break;
          }
          message.ethIndexSlot = reader.uint32();
          continue;
        case 24:
          if (tag !== 192) {
            break;
          }
          message.sourceBlockHeight = longToNumber(reader.uint64());
          continue;
        case 25:
          if (tag !== 202) {
            break;
          }
          message.owner = reader.bytes();
          continue;
        case 26:
          if (tag !== 210) {
            break;
          }
          message.metadata = reader.string();
          continue;
        case 27:
          if (tag !== 216) {
            break;
          }
          message.sourceNetworkId = reader.int32();
          continue;
        case 28:
          if (tag !== 224) {
            break;
          }
          message.maxCensusSize = longToNumber(reader.uint64());
          continue;
        case 29:
          if (tag !== 234) {
            break;
          }
          message.rollingCensusRoot = reader.bytes();
          continue;
        case 30:
          if (tag !== 240) {
            break;
          }
          message.rollingCensusSize = longToNumber(reader.uint64());
          continue;
        case 31:
          if (tag !== 250) {
            break;
          }
          message.nullifiersRoot = reader.bytes();
          continue;
        case 32:
          if (tag !== 258) {
            break;
          }
          message.sourceNetworkContractAddr = reader.bytes();
          continue;
        case 33:
          if (tag !== 264) {
            break;
          }
          message.tokenDecimals = reader.uint32();
          continue;
        case 34:
          if (tag !== 272) {
            break;
          }
          message.tempSIKs = reader.bool();
          continue;
        case 35:
          if (tag !== 280) {
            break;
          }
          message.startTime = reader.uint32();
          continue;
        case 36:
          if (tag !== 288) {
            break;
          }
          message.duration = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      processId: isSet(object.processId) ? bytesFromBase64(object.processId) : new Uint8Array(0),
      entityId: isSet(object.entityId) ? bytesFromBase64(object.entityId) : new Uint8Array(0),
      startBlock: isSet(object.startBlock) ? globalThis.Number(object.startBlock) : 0,
      blockCount: isSet(object.blockCount) ? globalThis.Number(object.blockCount) : 0,
      censusRoot: isSet(object.censusRoot) ? bytesFromBase64(object.censusRoot) : new Uint8Array(0),
      censusURI: isSet(object.censusURI) ? globalThis.String(object.censusURI) : void 0,
      encryptionPrivateKeys: globalThis.Array.isArray(object?.encryptionPrivateKeys) ? object.encryptionPrivateKeys.map((e) => globalThis.String(e)) : [],
      encryptionPublicKeys: globalThis.Array.isArray(object?.encryptionPublicKeys) ? object.encryptionPublicKeys.map((e) => globalThis.String(e)) : [],
      keyIndex: isSet(object.keyIndex) ? globalThis.Number(object.keyIndex) : void 0,
      status: isSet(object.status) ? processStatusFromJSON(object.status) : 0,
      paramsSignature: isSet(object.paramsSignature) ? bytesFromBase64(object.paramsSignature) : void 0,
      namespace: isSet(object.namespace) ? globalThis.Number(object.namespace) : 0,
      envelopeType: isSet(object.envelopeType) ? EnvelopeType.fromJSON(object.envelopeType) : void 0,
      mode: isSet(object.mode) ? ProcessMode.fromJSON(object.mode) : void 0,
      questionIndex: isSet(object.questionIndex) ? globalThis.Number(object.questionIndex) : void 0,
      questionCount: isSet(object.questionCount) ? globalThis.Number(object.questionCount) : void 0,
      voteOptions: isSet(object.voteOptions) ? ProcessVoteOptions.fromJSON(object.voteOptions) : void 0,
      censusOrigin: isSet(object.censusOrigin) ? censusOriginFromJSON(object.censusOrigin) : 0,
      results: isSet(object.results) ? ProcessResult.fromJSON(object.results) : void 0,
      ethIndexSlot: isSet(object.ethIndexSlot) ? globalThis.Number(object.ethIndexSlot) : void 0,
      sourceBlockHeight: isSet(object.sourceBlockHeight) ? globalThis.Number(object.sourceBlockHeight) : void 0,
      owner: isSet(object.owner) ? bytesFromBase64(object.owner) : void 0,
      metadata: isSet(object.metadata) ? globalThis.String(object.metadata) : void 0,
      sourceNetworkId: isSet(object.sourceNetworkId) ? sourceNetworkIdFromJSON(object.sourceNetworkId) : 0,
      maxCensusSize: isSet(object.maxCensusSize) ? globalThis.Number(object.maxCensusSize) : 0,
      rollingCensusRoot: isSet(object.rollingCensusRoot) ? bytesFromBase64(object.rollingCensusRoot) : void 0,
      rollingCensusSize: isSet(object.rollingCensusSize) ? globalThis.Number(object.rollingCensusSize) : void 0,
      nullifiersRoot: isSet(object.nullifiersRoot) ? bytesFromBase64(object.nullifiersRoot) : void 0,
      sourceNetworkContractAddr: isSet(object.sourceNetworkContractAddr) ? bytesFromBase64(object.sourceNetworkContractAddr) : void 0,
      tokenDecimals: isSet(object.tokenDecimals) ? globalThis.Number(object.tokenDecimals) : void 0,
      tempSIKs: isSet(object.tempSIKs) ? globalThis.Boolean(object.tempSIKs) : void 0,
      startTime: isSet(object.startTime) ? globalThis.Number(object.startTime) : 0,
      duration: isSet(object.duration) ? globalThis.Number(object.duration) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.processId.length !== 0) {
      obj.processId = base64FromBytes(message.processId);
    }
    if (message.entityId.length !== 0) {
      obj.entityId = base64FromBytes(message.entityId);
    }
    if (message.startBlock !== 0) {
      obj.startBlock = Math.round(message.startBlock);
    }
    if (message.blockCount !== 0) {
      obj.blockCount = Math.round(message.blockCount);
    }
    if (message.censusRoot.length !== 0) {
      obj.censusRoot = base64FromBytes(message.censusRoot);
    }
    if (message.censusURI !== void 0) {
      obj.censusURI = message.censusURI;
    }
    if (message.encryptionPrivateKeys?.length) {
      obj.encryptionPrivateKeys = message.encryptionPrivateKeys;
    }
    if (message.encryptionPublicKeys?.length) {
      obj.encryptionPublicKeys = message.encryptionPublicKeys;
    }
    if (message.keyIndex !== void 0) {
      obj.keyIndex = Math.round(message.keyIndex);
    }
    if (message.status !== 0) {
      obj.status = processStatusToJSON(message.status);
    }
    if (message.paramsSignature !== void 0) {
      obj.paramsSignature = base64FromBytes(message.paramsSignature);
    }
    if (message.namespace !== 0) {
      obj.namespace = Math.round(message.namespace);
    }
    if (message.envelopeType !== void 0) {
      obj.envelopeType = EnvelopeType.toJSON(message.envelopeType);
    }
    if (message.mode !== void 0) {
      obj.mode = ProcessMode.toJSON(message.mode);
    }
    if (message.questionIndex !== void 0) {
      obj.questionIndex = Math.round(message.questionIndex);
    }
    if (message.questionCount !== void 0) {
      obj.questionCount = Math.round(message.questionCount);
    }
    if (message.voteOptions !== void 0) {
      obj.voteOptions = ProcessVoteOptions.toJSON(message.voteOptions);
    }
    if (message.censusOrigin !== 0) {
      obj.censusOrigin = censusOriginToJSON(message.censusOrigin);
    }
    if (message.results !== void 0) {
      obj.results = ProcessResult.toJSON(message.results);
    }
    if (message.ethIndexSlot !== void 0) {
      obj.ethIndexSlot = Math.round(message.ethIndexSlot);
    }
    if (message.sourceBlockHeight !== void 0) {
      obj.sourceBlockHeight = Math.round(message.sourceBlockHeight);
    }
    if (message.owner !== void 0) {
      obj.owner = base64FromBytes(message.owner);
    }
    if (message.metadata !== void 0) {
      obj.metadata = message.metadata;
    }
    if (message.sourceNetworkId !== 0) {
      obj.sourceNetworkId = sourceNetworkIdToJSON(message.sourceNetworkId);
    }
    if (message.maxCensusSize !== 0) {
      obj.maxCensusSize = Math.round(message.maxCensusSize);
    }
    if (message.rollingCensusRoot !== void 0) {
      obj.rollingCensusRoot = base64FromBytes(message.rollingCensusRoot);
    }
    if (message.rollingCensusSize !== void 0) {
      obj.rollingCensusSize = Math.round(message.rollingCensusSize);
    }
    if (message.nullifiersRoot !== void 0) {
      obj.nullifiersRoot = base64FromBytes(message.nullifiersRoot);
    }
    if (message.sourceNetworkContractAddr !== void 0) {
      obj.sourceNetworkContractAddr = base64FromBytes(message.sourceNetworkContractAddr);
    }
    if (message.tokenDecimals !== void 0) {
      obj.tokenDecimals = Math.round(message.tokenDecimals);
    }
    if (message.tempSIKs !== void 0) {
      obj.tempSIKs = message.tempSIKs;
    }
    if (message.startTime !== 0) {
      obj.startTime = Math.round(message.startTime);
    }
    if (message.duration !== 0) {
      obj.duration = Math.round(message.duration);
    }
    return obj;
  },
  create(base) {
    return Process.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcess();
    message.processId = object.processId ?? new Uint8Array(0);
    message.entityId = object.entityId ?? new Uint8Array(0);
    message.startBlock = object.startBlock ?? 0;
    message.blockCount = object.blockCount ?? 0;
    message.censusRoot = object.censusRoot ?? new Uint8Array(0);
    message.censusURI = object.censusURI ?? void 0;
    message.encryptionPrivateKeys = object.encryptionPrivateKeys?.map((e) => e) || [];
    message.encryptionPublicKeys = object.encryptionPublicKeys?.map((e) => e) || [];
    message.keyIndex = object.keyIndex ?? void 0;
    message.status = object.status ?? 0;
    message.paramsSignature = object.paramsSignature ?? void 0;
    message.namespace = object.namespace ?? 0;
    message.envelopeType = object.envelopeType !== void 0 && object.envelopeType !== null ? EnvelopeType.fromPartial(object.envelopeType) : void 0;
    message.mode = object.mode !== void 0 && object.mode !== null ? ProcessMode.fromPartial(object.mode) : void 0;
    message.questionIndex = object.questionIndex ?? void 0;
    message.questionCount = object.questionCount ?? void 0;
    message.voteOptions = object.voteOptions !== void 0 && object.voteOptions !== null ? ProcessVoteOptions.fromPartial(object.voteOptions) : void 0;
    message.censusOrigin = object.censusOrigin ?? 0;
    message.results = object.results !== void 0 && object.results !== null ? ProcessResult.fromPartial(object.results) : void 0;
    message.ethIndexSlot = object.ethIndexSlot ?? void 0;
    message.sourceBlockHeight = object.sourceBlockHeight ?? void 0;
    message.owner = object.owner ?? void 0;
    message.metadata = object.metadata ?? void 0;
    message.sourceNetworkId = object.sourceNetworkId ?? 0;
    message.maxCensusSize = object.maxCensusSize ?? 0;
    message.rollingCensusRoot = object.rollingCensusRoot ?? void 0;
    message.rollingCensusSize = object.rollingCensusSize ?? void 0;
    message.nullifiersRoot = object.nullifiersRoot ?? void 0;
    message.sourceNetworkContractAddr = object.sourceNetworkContractAddr ?? void 0;
    message.tokenDecimals = object.tokenDecimals ?? void 0;
    message.tempSIKs = object.tempSIKs ?? void 0;
    message.startTime = object.startTime ?? 0;
    message.duration = object.duration ?? 0;
    return message;
  }
};
function createBaseEnvelopeType() {
  return { serial: false, anonymous: false, encryptedVotes: false, uniqueValues: false, costFromWeight: false };
}
var EnvelopeType = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.serial !== false) {
      writer.uint32(8).bool(message.serial);
    }
    if (message.anonymous !== false) {
      writer.uint32(16).bool(message.anonymous);
    }
    if (message.encryptedVotes !== false) {
      writer.uint32(24).bool(message.encryptedVotes);
    }
    if (message.uniqueValues !== false) {
      writer.uint32(32).bool(message.uniqueValues);
    }
    if (message.costFromWeight !== false) {
      writer.uint32(40).bool(message.costFromWeight);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEnvelopeType();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.serial = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.anonymous = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.encryptedVotes = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.uniqueValues = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }
          message.costFromWeight = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      serial: isSet(object.serial) ? globalThis.Boolean(object.serial) : false,
      anonymous: isSet(object.anonymous) ? globalThis.Boolean(object.anonymous) : false,
      encryptedVotes: isSet(object.encryptedVotes) ? globalThis.Boolean(object.encryptedVotes) : false,
      uniqueValues: isSet(object.uniqueValues) ? globalThis.Boolean(object.uniqueValues) : false,
      costFromWeight: isSet(object.costFromWeight) ? globalThis.Boolean(object.costFromWeight) : false
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.serial !== false) {
      obj.serial = message.serial;
    }
    if (message.anonymous !== false) {
      obj.anonymous = message.anonymous;
    }
    if (message.encryptedVotes !== false) {
      obj.encryptedVotes = message.encryptedVotes;
    }
    if (message.uniqueValues !== false) {
      obj.uniqueValues = message.uniqueValues;
    }
    if (message.costFromWeight !== false) {
      obj.costFromWeight = message.costFromWeight;
    }
    return obj;
  },
  create(base) {
    return EnvelopeType.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEnvelopeType();
    message.serial = object.serial ?? false;
    message.anonymous = object.anonymous ?? false;
    message.encryptedVotes = object.encryptedVotes ?? false;
    message.uniqueValues = object.uniqueValues ?? false;
    message.costFromWeight = object.costFromWeight ?? false;
    return message;
  }
};
function createBaseProcessMode() {
  return { autoStart: false, interruptible: false, dynamicCensus: false, encryptedMetaData: false, preRegister: false };
}
var ProcessMode = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.autoStart !== false) {
      writer.uint32(8).bool(message.autoStart);
    }
    if (message.interruptible !== false) {
      writer.uint32(16).bool(message.interruptible);
    }
    if (message.dynamicCensus !== false) {
      writer.uint32(24).bool(message.dynamicCensus);
    }
    if (message.encryptedMetaData !== false) {
      writer.uint32(32).bool(message.encryptedMetaData);
    }
    if (message.preRegister !== false) {
      writer.uint32(40).bool(message.preRegister);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProcessMode();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.autoStart = reader.bool();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.interruptible = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.dynamicCensus = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.encryptedMetaData = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }
          message.preRegister = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      autoStart: isSet(object.autoStart) ? globalThis.Boolean(object.autoStart) : false,
      interruptible: isSet(object.interruptible) ? globalThis.Boolean(object.interruptible) : false,
      dynamicCensus: isSet(object.dynamicCensus) ? globalThis.Boolean(object.dynamicCensus) : false,
      encryptedMetaData: isSet(object.encryptedMetaData) ? globalThis.Boolean(object.encryptedMetaData) : false,
      preRegister: isSet(object.preRegister) ? globalThis.Boolean(object.preRegister) : false
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.autoStart !== false) {
      obj.autoStart = message.autoStart;
    }
    if (message.interruptible !== false) {
      obj.interruptible = message.interruptible;
    }
    if (message.dynamicCensus !== false) {
      obj.dynamicCensus = message.dynamicCensus;
    }
    if (message.encryptedMetaData !== false) {
      obj.encryptedMetaData = message.encryptedMetaData;
    }
    if (message.preRegister !== false) {
      obj.preRegister = message.preRegister;
    }
    return obj;
  },
  create(base) {
    return ProcessMode.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMode();
    message.autoStart = object.autoStart ?? false;
    message.interruptible = object.interruptible ?? false;
    message.dynamicCensus = object.dynamicCensus ?? false;
    message.encryptedMetaData = object.encryptedMetaData ?? false;
    message.preRegister = object.preRegister ?? false;
    return message;
  }
};
function createBaseProcessVoteOptions() {
  return { maxCount: 0, maxValue: 0, maxVoteOverwrites: 0, maxTotalCost: 0, costExponent: 0 };
}
var ProcessVoteOptions = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.maxCount !== 0) {
      writer.uint32(8).uint32(message.maxCount);
    }
    if (message.maxValue !== 0) {
      writer.uint32(16).uint32(message.maxValue);
    }
    if (message.maxVoteOverwrites !== 0) {
      writer.uint32(24).uint32(message.maxVoteOverwrites);
    }
    if (message.maxTotalCost !== 0) {
      writer.uint32(32).uint32(message.maxTotalCost);
    }
    if (message.costExponent !== 0) {
      writer.uint32(40).uint32(message.costExponent);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProcessVoteOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }
          message.maxCount = reader.uint32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.maxValue = reader.uint32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.maxVoteOverwrites = reader.uint32();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.maxTotalCost = reader.uint32();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }
          message.costExponent = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      maxCount: isSet(object.maxCount) ? globalThis.Number(object.maxCount) : 0,
      maxValue: isSet(object.maxValue) ? globalThis.Number(object.maxValue) : 0,
      maxVoteOverwrites: isSet(object.maxVoteOverwrites) ? globalThis.Number(object.maxVoteOverwrites) : 0,
      maxTotalCost: isSet(object.maxTotalCost) ? globalThis.Number(object.maxTotalCost) : 0,
      costExponent: isSet(object.costExponent) ? globalThis.Number(object.costExponent) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.maxCount !== 0) {
      obj.maxCount = Math.round(message.maxCount);
    }
    if (message.maxValue !== 0) {
      obj.maxValue = Math.round(message.maxValue);
    }
    if (message.maxVoteOverwrites !== 0) {
      obj.maxVoteOverwrites = Math.round(message.maxVoteOverwrites);
    }
    if (message.maxTotalCost !== 0) {
      obj.maxTotalCost = Math.round(message.maxTotalCost);
    }
    if (message.costExponent !== 0) {
      obj.costExponent = Math.round(message.costExponent);
    }
    return obj;
  },
  create(base) {
    return ProcessVoteOptions.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessVoteOptions();
    message.maxCount = object.maxCount ?? 0;
    message.maxValue = object.maxValue ?? 0;
    message.maxVoteOverwrites = object.maxVoteOverwrites ?? 0;
    message.maxTotalCost = object.maxTotalCost ?? 0;
    message.costExponent = object.costExponent ?? 0;
    return message;
  }
};
function createBaseOracleList() {
  return { oracles: [] };
}
var OracleList = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    for (const v of message.oracles) {
      writer.uint32(10).bytes(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseOracleList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.oracles.push(reader.bytes());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      oracles: globalThis.Array.isArray(object?.oracles) ? object.oracles.map((e) => bytesFromBase64(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.oracles?.length) {
      obj.oracles = message.oracles.map((e) => base64FromBytes(e));
    }
    return obj;
  },
  create(base) {
    return OracleList.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseOracleList();
    message.oracles = object.oracles?.map((e) => e) || [];
    return message;
  }
};
function createBaseValidatorList() {
  return { validators: [] };
}
var ValidatorList = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    for (const v of message.validators) {
      Validator.encode(v, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseValidatorList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.validators.push(Validator.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      validators: globalThis.Array.isArray(object?.validators) ? object.validators.map((e) => Validator.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.validators?.length) {
      obj.validators = message.validators.map((e) => Validator.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return ValidatorList.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseValidatorList();
    message.validators = object.validators?.map((e) => Validator.fromPartial(e)) || [];
    return message;
  }
};
function createBaseValidator() {
  return {
    address: new Uint8Array(0),
    pubKey: new Uint8Array(0),
    power: 0,
    name: "",
    keyIndex: 0,
    height: 0,
    proposals: 0,
    votes: 0,
    validatorAddress: new Uint8Array(0),
    score: 0
  };
}
var Validator = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.address.length !== 0) {
      writer.uint32(10).bytes(message.address);
    }
    if (message.pubKey.length !== 0) {
      writer.uint32(18).bytes(message.pubKey);
    }
    if (message.power !== 0) {
      writer.uint32(24).uint64(message.power);
    }
    if (message.name !== "") {
      writer.uint32(34).string(message.name);
    }
    if (message.keyIndex !== 0) {
      writer.uint32(40).uint32(message.keyIndex);
    }
    if (message.height !== 0) {
      writer.uint32(48).uint64(message.height);
    }
    if (message.proposals !== 0) {
      writer.uint32(56).uint64(message.proposals);
    }
    if (message.votes !== 0) {
      writer.uint32(64).uint64(message.votes);
    }
    if (message.validatorAddress.length !== 0) {
      writer.uint32(74).bytes(message.validatorAddress);
    }
    if (message.score !== 0) {
      writer.uint32(80).uint32(message.score);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.address = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.pubKey = reader.bytes();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.power = longToNumber(reader.uint64());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.name = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }
          message.keyIndex = reader.uint32();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }
          message.height = longToNumber(reader.uint64());
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }
          message.proposals = longToNumber(reader.uint64());
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }
          message.votes = longToNumber(reader.uint64());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.validatorAddress = reader.bytes();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }
          message.score = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      address: isSet(object.address) ? bytesFromBase64(object.address) : new Uint8Array(0),
      pubKey: isSet(object.pubKey) ? bytesFromBase64(object.pubKey) : new Uint8Array(0),
      power: isSet(object.power) ? globalThis.Number(object.power) : 0,
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      keyIndex: isSet(object.keyIndex) ? globalThis.Number(object.keyIndex) : 0,
      height: isSet(object.height) ? globalThis.Number(object.height) : 0,
      proposals: isSet(object.proposals) ? globalThis.Number(object.proposals) : 0,
      votes: isSet(object.votes) ? globalThis.Number(object.votes) : 0,
      validatorAddress: isSet(object.validatorAddress) ? bytesFromBase64(object.validatorAddress) : new Uint8Array(0),
      score: isSet(object.score) ? globalThis.Number(object.score) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.address.length !== 0) {
      obj.address = base64FromBytes(message.address);
    }
    if (message.pubKey.length !== 0) {
      obj.pubKey = base64FromBytes(message.pubKey);
    }
    if (message.power !== 0) {
      obj.power = Math.round(message.power);
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.keyIndex !== 0) {
      obj.keyIndex = Math.round(message.keyIndex);
    }
    if (message.height !== 0) {
      obj.height = Math.round(message.height);
    }
    if (message.proposals !== 0) {
      obj.proposals = Math.round(message.proposals);
    }
    if (message.votes !== 0) {
      obj.votes = Math.round(message.votes);
    }
    if (message.validatorAddress.length !== 0) {
      obj.validatorAddress = base64FromBytes(message.validatorAddress);
    }
    if (message.score !== 0) {
      obj.score = Math.round(message.score);
    }
    return obj;
  },
  create(base) {
    return Validator.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseValidator();
    message.address = object.address ?? new Uint8Array(0);
    message.pubKey = object.pubKey ?? new Uint8Array(0);
    message.power = object.power ?? 0;
    message.name = object.name ?? "";
    message.keyIndex = object.keyIndex ?? 0;
    message.height = object.height ?? 0;
    message.proposals = object.proposals ?? 0;
    message.votes = object.votes ?? 0;
    message.validatorAddress = object.validatorAddress ?? new Uint8Array(0);
    message.score = object.score ?? 0;
    return message;
  }
};
function createBaseTendermintHeader() {
  return {
    chainId: "",
    height: 0,
    timestamp: 0,
    blockID: new Uint8Array(0),
    lastCommitHash: new Uint8Array(0),
    dataHash: new Uint8Array(0),
    validatorsHash: new Uint8Array(0),
    nextValidatorsHash: new Uint8Array(0),
    consensusHash: new Uint8Array(0),
    appHash: new Uint8Array(0),
    lastResultsHash: new Uint8Array(0),
    evidenceHash: new Uint8Array(0),
    proposerAddress: new Uint8Array(0)
  };
}
var TendermintHeader = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.chainId !== "") {
      writer.uint32(18).string(message.chainId);
    }
    if (message.height !== 0) {
      writer.uint32(24).int64(message.height);
    }
    if (message.timestamp !== 0) {
      writer.uint32(32).int64(message.timestamp);
    }
    if (message.blockID.length !== 0) {
      writer.uint32(42).bytes(message.blockID);
    }
    if (message.lastCommitHash.length !== 0) {
      writer.uint32(50).bytes(message.lastCommitHash);
    }
    if (message.dataHash.length !== 0) {
      writer.uint32(58).bytes(message.dataHash);
    }
    if (message.validatorsHash.length !== 0) {
      writer.uint32(66).bytes(message.validatorsHash);
    }
    if (message.nextValidatorsHash.length !== 0) {
      writer.uint32(74).bytes(message.nextValidatorsHash);
    }
    if (message.consensusHash.length !== 0) {
      writer.uint32(82).bytes(message.consensusHash);
    }
    if (message.appHash.length !== 0) {
      writer.uint32(90).bytes(message.appHash);
    }
    if (message.lastResultsHash.length !== 0) {
      writer.uint32(98).bytes(message.lastResultsHash);
    }
    if (message.evidenceHash.length !== 0) {
      writer.uint32(106).bytes(message.evidenceHash);
    }
    if (message.proposerAddress.length !== 0) {
      writer.uint32(114).bytes(message.proposerAddress);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseTendermintHeader();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }
          message.chainId = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }
          message.height = longToNumber(reader.int64());
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.timestamp = longToNumber(reader.int64());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.blockID = reader.bytes();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.lastCommitHash = reader.bytes();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.dataHash = reader.bytes();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }
          message.validatorsHash = reader.bytes();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.nextValidatorsHash = reader.bytes();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }
          message.consensusHash = reader.bytes();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }
          message.appHash = reader.bytes();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }
          message.lastResultsHash = reader.bytes();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }
          message.evidenceHash = reader.bytes();
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }
          message.proposerAddress = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      chainId: isSet(object.chainId) ? globalThis.String(object.chainId) : "",
      height: isSet(object.height) ? globalThis.Number(object.height) : 0,
      timestamp: isSet(object.timestamp) ? globalThis.Number(object.timestamp) : 0,
      blockID: isSet(object.blockID) ? bytesFromBase64(object.blockID) : new Uint8Array(0),
      lastCommitHash: isSet(object.lastCommitHash) ? bytesFromBase64(object.lastCommitHash) : new Uint8Array(0),
      dataHash: isSet(object.dataHash) ? bytesFromBase64(object.dataHash) : new Uint8Array(0),
      validatorsHash: isSet(object.validatorsHash) ? bytesFromBase64(object.validatorsHash) : new Uint8Array(0),
      nextValidatorsHash: isSet(object.nextValidatorsHash) ? bytesFromBase64(object.nextValidatorsHash) : new Uint8Array(0),
      consensusHash: isSet(object.consensusHash) ? bytesFromBase64(object.consensusHash) : new Uint8Array(0),
      appHash: isSet(object.appHash) ? bytesFromBase64(object.appHash) : new Uint8Array(0),
      lastResultsHash: isSet(object.lastResultsHash) ? bytesFromBase64(object.lastResultsHash) : new Uint8Array(0),
      evidenceHash: isSet(object.evidenceHash) ? bytesFromBase64(object.evidenceHash) : new Uint8Array(0),
      proposerAddress: isSet(object.proposerAddress) ? bytesFromBase64(object.proposerAddress) : new Uint8Array(0)
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.chainId !== "") {
      obj.chainId = message.chainId;
    }
    if (message.height !== 0) {
      obj.height = Math.round(message.height);
    }
    if (message.timestamp !== 0) {
      obj.timestamp = Math.round(message.timestamp);
    }
    if (message.blockID.length !== 0) {
      obj.blockID = base64FromBytes(message.blockID);
    }
    if (message.lastCommitHash.length !== 0) {
      obj.lastCommitHash = base64FromBytes(message.lastCommitHash);
    }
    if (message.dataHash.length !== 0) {
      obj.dataHash = base64FromBytes(message.dataHash);
    }
    if (message.validatorsHash.length !== 0) {
      obj.validatorsHash = base64FromBytes(message.validatorsHash);
    }
    if (message.nextValidatorsHash.length !== 0) {
      obj.nextValidatorsHash = base64FromBytes(message.nextValidatorsHash);
    }
    if (message.consensusHash.length !== 0) {
      obj.consensusHash = base64FromBytes(message.consensusHash);
    }
    if (message.appHash.length !== 0) {
      obj.appHash = base64FromBytes(message.appHash);
    }
    if (message.lastResultsHash.length !== 0) {
      obj.lastResultsHash = base64FromBytes(message.lastResultsHash);
    }
    if (message.evidenceHash.length !== 0) {
      obj.evidenceHash = base64FromBytes(message.evidenceHash);
    }
    if (message.proposerAddress.length !== 0) {
      obj.proposerAddress = base64FromBytes(message.proposerAddress);
    }
    return obj;
  },
  create(base) {
    return TendermintHeader.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseTendermintHeader();
    message.chainId = object.chainId ?? "";
    message.height = object.height ?? 0;
    message.timestamp = object.timestamp ?? 0;
    message.blockID = object.blockID ?? new Uint8Array(0);
    message.lastCommitHash = object.lastCommitHash ?? new Uint8Array(0);
    message.dataHash = object.dataHash ?? new Uint8Array(0);
    message.validatorsHash = object.validatorsHash ?? new Uint8Array(0);
    message.nextValidatorsHash = object.nextValidatorsHash ?? new Uint8Array(0);
    message.consensusHash = object.consensusHash ?? new Uint8Array(0);
    message.appHash = object.appHash ?? new Uint8Array(0);
    message.lastResultsHash = object.lastResultsHash ?? new Uint8Array(0);
    message.evidenceHash = object.evidenceHash ?? new Uint8Array(0);
    message.proposerAddress = object.proposerAddress ?? new Uint8Array(0);
    return message;
  }
};
function createBaseProcessResult() {
  return { votes: [] };
}
var ProcessResult = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    for (const v of message.votes) {
      QuestionResult.encode(v, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProcessResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.votes.push(QuestionResult.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      votes: globalThis.Array.isArray(object?.votes) ? object.votes.map((e) => QuestionResult.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.votes?.length) {
      obj.votes = message.votes.map((e) => QuestionResult.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return ProcessResult.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessResult();
    message.votes = object.votes?.map((e) => QuestionResult.fromPartial(e)) || [];
    return message;
  }
};
function createBaseQuestionResult() {
  return { question: [] };
}
var QuestionResult = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    for (const v of message.question) {
      writer.uint32(10).bytes(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseQuestionResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.question.push(reader.bytes());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      question: globalThis.Array.isArray(object?.question) ? object.question.map((e) => bytesFromBase64(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.question?.length) {
      obj.question = message.question.map((e) => base64FromBytes(e));
    }
    return obj;
  },
  create(base) {
    return QuestionResult.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseQuestionResult();
    message.question = object.question?.map((e) => e) || [];
    return message;
  }
};
function createBaseProcessEndingList() {
  return { processList: [] };
}
var ProcessEndingList = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    for (const v of message.processList) {
      writer.uint32(10).bytes(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProcessEndingList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.processList.push(reader.bytes());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      processList: globalThis.Array.isArray(object?.processList) ? object.processList.map((e) => bytesFromBase64(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.processList?.length) {
      obj.processList = message.processList.map((e) => base64FromBytes(e));
    }
    return obj;
  },
  create(base) {
    return ProcessEndingList.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessEndingList();
    message.processList = object.processList?.map((e) => e) || [];
    return message;
  }
};
function createBaseStoredKeys() {
  return { pids: [] };
}
var StoredKeys = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    for (const v of message.pids) {
      writer.uint32(10).bytes(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseStoredKeys();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.pids.push(reader.bytes());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { pids: globalThis.Array.isArray(object?.pids) ? object.pids.map((e) => bytesFromBase64(e)) : [] };
  },
  toJSON(message) {
    const obj = {};
    if (message.pids?.length) {
      obj.pids = message.pids.map((e) => base64FromBytes(e));
    }
    return obj;
  },
  create(base) {
    return StoredKeys.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseStoredKeys();
    message.pids = object.pids?.map((e) => e) || [];
    return message;
  }
};
function bytesFromBase64(b64) {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}
function base64FromBytes(arr) {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}
function longToNumber(long) {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  if (long.lt(globalThis.Number.MIN_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is smaller than Number.MIN_SAFE_INTEGER");
  }
  return long.toNumber();
}
if (import_minimal.default.util.Long !== import_long.default) {
  import_minimal.default.util.Long = import_long.default;
  import_minimal.default.configure();
}
function isSet(value) {
  return value !== null && value !== void 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Account,
  AdminTx,
  CAbundle,
  Census,
  CensusOrigin,
  Census_Type,
  CollectFaucetTx,
  EnvelopeType,
  FaucetPackage,
  FaucetPayload,
  NewProcessTx,
  OracleList,
  Process,
  ProcessEndingList,
  ProcessMode,
  ProcessResult,
  ProcessStatus,
  ProcessVoteOptions,
  Proof,
  ProofArbo,
  ProofArbo_KeyType,
  ProofArbo_Type,
  ProofCA,
  ProofCA_Type,
  ProofEthereumAccount,
  ProofEthereumStorage,
  ProofFarcasterFrame,
  ProofMinime,
  ProofZkSNARK,
  QuestionResult,
  RegisterKeyTx,
  RegisterSIKTx,
  SIKTx,
  SendTokensTx,
  SetAccountTx,
  SetKeykeeperTx,
  SetProcessTx,
  SetTransactionCostsTx,
  SignedTx,
  SourceNetworkId,
  StoredKeys,
  TendermintHeader,
  Tx,
  TxType,
  Validator,
  ValidatorList,
  VoteEnvelope,
  censusOriginFromJSON,
  censusOriginToJSON,
  census_TypeFromJSON,
  census_TypeToJSON,
  processStatusFromJSON,
  processStatusToJSON,
  proofArbo_KeyTypeFromJSON,
  proofArbo_KeyTypeToJSON,
  proofArbo_TypeFromJSON,
  proofArbo_TypeToJSON,
  proofCA_TypeFromJSON,
  proofCA_TypeToJSON,
  sourceNetworkIdFromJSON,
  sourceNetworkIdToJSON,
  txTypeFromJSON,
  txTypeToJSON
});
