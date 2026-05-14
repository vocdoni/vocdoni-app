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
    util.isObject = function isObject3(value) {
      return value && typeof value === "object";
    };
    util.isset = /**
     * Checks if a property on a message is considered to be present.
     * @param {Object} obj Plain object or message instance
     * @param {string} prop Property name
     * @returns {boolean} `true` if considered to be present, otherwise `false`
     */
    util.isSet = function isSet6(obj, prop) {
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

// build/ts/client-store/index.ts
var client_store_exports = {};
__export(client_store_exports, {
  Account: () => account_exports,
  Backup: () => backup_exports,
  Gateway: () => gateway_exports,
  Wallet: () => wallet_exports
});
module.exports = __toCommonJS(client_store_exports);

// build/ts/client-store/account.ts
var account_exports = {};
__export(account_exports, {
  Account: () => Account,
  Account_AppVoter: () => Account_AppVoter,
  Account_Extra: () => Account_Extra,
  Account_MetaEntry: () => Account_MetaEntry,
  Account_WebEntity: () => Account_WebEntity,
  AccountsStore: () => AccountsStore
});
var import_minimal3 = __toESM(require_minimal2());

// build/ts/metadata/entity.ts
var import_minimal = __toESM(require_minimal2());
function createBaseEntityReference() {
  return { entityId: "", entryPoints: [] };
}
var EntityReference = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.entityId !== "") {
      writer.uint32(10).string(message.entityId);
    }
    for (const v of message.entryPoints) {
      writer.uint32(18).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityReference();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.entityId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.entryPoints.push(reader.string());
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
      entityId: isSet(object.entityId) ? globalThis.String(object.entityId) : "",
      entryPoints: globalThis.Array.isArray(object?.entryPoints) ? object.entryPoints.map((e) => globalThis.String(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.entityId !== "") {
      obj.entityId = message.entityId;
    }
    if (message.entryPoints?.length) {
      obj.entryPoints = message.entryPoints;
    }
    return obj;
  },
  create(base) {
    return EntityReference.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityReference();
    message.entityId = object.entityId ?? "";
    message.entryPoints = object.entryPoints?.map((e) => e) || [];
    return message;
  }
};
function isSet(value) {
  return value !== null && value !== void 0;
}

// build/ts/client-store/wallet.ts
var wallet_exports = {};
__export(wallet_exports, {
  Wallet: () => Wallet,
  Wallet_AuthMethod: () => Wallet_AuthMethod,
  wallet_AuthMethodFromJSON: () => wallet_AuthMethodFromJSON,
  wallet_AuthMethodToJSON: () => wallet_AuthMethodToJSON
});
var import_minimal2 = __toESM(require_minimal2());
var Wallet_AuthMethod = /* @__PURE__ */ ((Wallet_AuthMethod2) => {
  Wallet_AuthMethod2[Wallet_AuthMethod2["PASS"] = 0] = "PASS";
  Wallet_AuthMethod2[Wallet_AuthMethod2["PIN"] = 1] = "PIN";
  Wallet_AuthMethod2[Wallet_AuthMethod2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
  return Wallet_AuthMethod2;
})(Wallet_AuthMethod || {});
function wallet_AuthMethodFromJSON(object) {
  switch (object) {
    case 0:
    case "PASS":
      return 0 /* PASS */;
    case 1:
    case "PIN":
      return 1 /* PIN */;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1 /* UNRECOGNIZED */;
  }
}
function wallet_AuthMethodToJSON(object) {
  switch (object) {
    case 0 /* PASS */:
      return "PASS";
    case 1 /* PIN */:
      return "PIN";
    case -1 /* UNRECOGNIZED */:
    default:
      return "UNRECOGNIZED";
  }
}
function createBaseWallet() {
  return { encryptedMnemonic: new Uint8Array(0), hdPath: "", locale: "", authMethod: 0 };
}
var Wallet = {
  encode(message, writer = import_minimal2.default.Writer.create()) {
    if (message.encryptedMnemonic.length !== 0) {
      writer.uint32(10).bytes(message.encryptedMnemonic);
    }
    if (message.hdPath !== "") {
      writer.uint32(18).string(message.hdPath);
    }
    if (message.locale !== "") {
      writer.uint32(26).string(message.locale);
    }
    if (message.authMethod !== 0) {
      writer.uint32(32).int32(message.authMethod);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal2.default.Reader ? input : import_minimal2.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWallet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.encryptedMnemonic = reader.bytes();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.hdPath = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.locale = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.authMethod = reader.int32();
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
      encryptedMnemonic: isSet2(object.encryptedMnemonic) ? bytesFromBase64(object.encryptedMnemonic) : new Uint8Array(0),
      hdPath: isSet2(object.hdPath) ? globalThis.String(object.hdPath) : "",
      locale: isSet2(object.locale) ? globalThis.String(object.locale) : "",
      authMethod: isSet2(object.authMethod) ? wallet_AuthMethodFromJSON(object.authMethod) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.encryptedMnemonic.length !== 0) {
      obj.encryptedMnemonic = base64FromBytes(message.encryptedMnemonic);
    }
    if (message.hdPath !== "") {
      obj.hdPath = message.hdPath;
    }
    if (message.locale !== "") {
      obj.locale = message.locale;
    }
    if (message.authMethod !== 0) {
      obj.authMethod = wallet_AuthMethodToJSON(message.authMethod);
    }
    return obj;
  },
  create(base) {
    return Wallet.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWallet();
    message.encryptedMnemonic = object.encryptedMnemonic ?? new Uint8Array(0);
    message.hdPath = object.hdPath ?? "";
    message.locale = object.locale ?? "";
    message.authMethod = object.authMethod ?? 0;
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
function isSet2(value) {
  return value !== null && value !== void 0;
}

// build/ts/client-store/account.ts
function createBaseAccountsStore() {
  return { items: [] };
}
var AccountsStore = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    for (const v of message.items) {
      Account.encode(v, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseAccountsStore();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.items.push(Account.decode(reader, reader.uint32()));
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
    return { items: globalThis.Array.isArray(object?.items) ? object.items.map((e) => Account.fromJSON(e)) : [] };
  },
  toJSON(message) {
    const obj = {};
    if (message.items?.length) {
      obj.items = message.items.map((e) => Account.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return AccountsStore.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseAccountsStore();
    message.items = object.items?.map((e) => Account.fromPartial(e)) || [];
    return message;
  }
};
function createBaseAccount() {
  return { name: "", wallet: void 0, address: "", hasBackup: false, extra: void 0, meta: {} };
}
var Account = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.wallet !== void 0) {
      Wallet.encode(message.wallet, writer.uint32(18).fork()).ldelim();
    }
    if (message.address !== "") {
      writer.uint32(26).string(message.address);
    }
    if (message.hasBackup !== false) {
      writer.uint32(32).bool(message.hasBackup);
    }
    if (message.extra !== void 0) {
      Account_Extra.encode(message.extra, writer.uint32(42).fork()).ldelim();
    }
    Object.entries(message.meta).forEach(([key, value]) => {
      Account_MetaEntry.encode({ key, value }, writer.uint32(802).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.wallet = Wallet.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.address = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }
          message.hasBackup = reader.bool();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.extra = Account_Extra.decode(reader, reader.uint32());
          continue;
        case 100:
          if (tag !== 802) {
            break;
          }
          const entry100 = Account_MetaEntry.decode(reader, reader.uint32());
          if (entry100.value !== void 0) {
            message.meta[entry100.key] = entry100.value;
          }
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
      name: isSet3(object.name) ? globalThis.String(object.name) : "",
      wallet: isSet3(object.wallet) ? Wallet.fromJSON(object.wallet) : void 0,
      address: isSet3(object.address) ? globalThis.String(object.address) : "",
      hasBackup: isSet3(object.hasBackup) ? globalThis.Boolean(object.hasBackup) : false,
      extra: isSet3(object.extra) ? Account_Extra.fromJSON(object.extra) : void 0,
      meta: isObject(object.meta) ? Object.entries(object.meta).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {}
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.wallet !== void 0) {
      obj.wallet = Wallet.toJSON(message.wallet);
    }
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.hasBackup !== false) {
      obj.hasBackup = message.hasBackup;
    }
    if (message.extra !== void 0) {
      obj.extra = Account_Extra.toJSON(message.extra);
    }
    if (message.meta) {
      const entries = Object.entries(message.meta);
      if (entries.length > 0) {
        obj.meta = {};
        entries.forEach(([k, v]) => {
          obj.meta[k] = v;
        });
      }
    }
    return obj;
  },
  create(base) {
    return Account.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseAccount();
    message.name = object.name ?? "";
    message.wallet = object.wallet !== void 0 && object.wallet !== null ? Wallet.fromPartial(object.wallet) : void 0;
    message.address = object.address ?? "";
    message.hasBackup = object.hasBackup ?? false;
    message.extra = object.extra !== void 0 && object.extra !== null ? Account_Extra.fromPartial(object.extra) : void 0;
    message.meta = Object.entries(object.meta ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    return message;
  }
};
function createBaseAccount_AppVoter() {
  return { appAnalyticsID: "", entities: [] };
}
var Account_AppVoter = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.appAnalyticsID !== "") {
      writer.uint32(10).string(message.appAnalyticsID);
    }
    for (const v of message.entities) {
      EntityReference.encode(v, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseAccount_AppVoter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.appAnalyticsID = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.entities.push(EntityReference.decode(reader, reader.uint32()));
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
      appAnalyticsID: isSet3(object.appAnalyticsID) ? globalThis.String(object.appAnalyticsID) : "",
      entities: globalThis.Array.isArray(object?.entities) ? object.entities.map((e) => EntityReference.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.appAnalyticsID !== "") {
      obj.appAnalyticsID = message.appAnalyticsID;
    }
    if (message.entities?.length) {
      obj.entities = message.entities.map((e) => EntityReference.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return Account_AppVoter.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseAccount_AppVoter();
    message.appAnalyticsID = object.appAnalyticsID ?? "";
    message.entities = object.entities?.map((e) => EntityReference.fromPartial(e)) || [];
    return message;
  }
};
function createBaseAccount_WebEntity() {
  return { webAnalyticsID: "" };
}
var Account_WebEntity = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.webAnalyticsID !== "") {
      writer.uint32(10).string(message.webAnalyticsID);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseAccount_WebEntity();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.webAnalyticsID = reader.string();
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
    return { webAnalyticsID: isSet3(object.webAnalyticsID) ? globalThis.String(object.webAnalyticsID) : "" };
  },
  toJSON(message) {
    const obj = {};
    if (message.webAnalyticsID !== "") {
      obj.webAnalyticsID = message.webAnalyticsID;
    }
    return obj;
  },
  create(base) {
    return Account_WebEntity.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseAccount_WebEntity();
    message.webAnalyticsID = object.webAnalyticsID ?? "";
    return message;
  }
};
function createBaseAccount_Extra() {
  return { content: void 0 };
}
var Account_Extra = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    switch (message.content?.$case) {
      case "appVoter":
        Account_AppVoter.encode(message.content.appVoter, writer.uint32(10).fork()).ldelim();
        break;
      case "webEntity":
        Account_WebEntity.encode(message.content.webEntity, writer.uint32(18).fork()).ldelim();
        break;
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseAccount_Extra();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.content = { $case: "appVoter", appVoter: Account_AppVoter.decode(reader, reader.uint32()) };
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.content = { $case: "webEntity", webEntity: Account_WebEntity.decode(reader, reader.uint32()) };
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
      content: isSet3(object.appVoter) ? { $case: "appVoter", appVoter: Account_AppVoter.fromJSON(object.appVoter) } : isSet3(object.webEntity) ? { $case: "webEntity", webEntity: Account_WebEntity.fromJSON(object.webEntity) } : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.content?.$case === "appVoter") {
      obj.appVoter = Account_AppVoter.toJSON(message.content.appVoter);
    }
    if (message.content?.$case === "webEntity") {
      obj.webEntity = Account_WebEntity.toJSON(message.content.webEntity);
    }
    return obj;
  },
  create(base) {
    return Account_Extra.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseAccount_Extra();
    if (object.content?.$case === "appVoter" && object.content?.appVoter !== void 0 && object.content?.appVoter !== null) {
      message.content = { $case: "appVoter", appVoter: Account_AppVoter.fromPartial(object.content.appVoter) };
    }
    if (object.content?.$case === "webEntity" && object.content?.webEntity !== void 0 && object.content?.webEntity !== null) {
      message.content = { $case: "webEntity", webEntity: Account_WebEntity.fromPartial(object.content.webEntity) };
    }
    return message;
  }
};
function createBaseAccount_MetaEntry() {
  return { key: "", value: "" };
}
var Account_MetaEntry = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseAccount_MetaEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.value = reader.string();
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
      key: isSet3(object.key) ? globalThis.String(object.key) : "",
      value: isSet3(object.value) ? globalThis.String(object.value) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },
  create(base) {
    return Account_MetaEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseAccount_MetaEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isSet3(value) {
  return value !== null && value !== void 0;
}

// build/ts/client-store/backup.ts
var backup_exports = {};
__export(backup_exports, {
  WalletBackup: () => WalletBackup,
  WalletBackup_Recovery: () => WalletBackup_Recovery,
  WalletBackup_Recovery_QuestionEnum: () => WalletBackup_Recovery_QuestionEnum,
  walletBackup_Recovery_QuestionEnumFromJSON: () => walletBackup_Recovery_QuestionEnumFromJSON,
  walletBackup_Recovery_QuestionEnumToJSON: () => walletBackup_Recovery_QuestionEnumToJSON
});
var import_long = __toESM(require("long"));
var import_minimal4 = __toESM(require_minimal2());
var WalletBackup_Recovery_QuestionEnum = /* @__PURE__ */ ((WalletBackup_Recovery_QuestionEnum2) => {
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["FAVORITE_BOOK"] = 0] = "FAVORITE_BOOK";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["FIRST_PET"] = 1] = "FIRST_PET";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["WHERE_HIGH_SCHOOL_COLLEGE"] = 2] = "WHERE_HIGH_SCHOOL_COLLEGE";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["CITY_OF_BIRTH"] = 3] = "CITY_OF_BIRTH";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["FAVORITE_CHILDHOOD_FRIEND"] = 4] = "FAVORITE_CHILDHOOD_FRIEND";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["WHERE_FATHER_AND_MOTHER_MET"] = 5] = "WHERE_FATHER_AND_MOTHER_MET";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["FAVORITE_MOVIE"] = 6] = "FAVORITE_MOVIE";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["FAVORITE_SPORT_HIGH_SCHOOL"] = 7] = "FAVORITE_SPORT_HIGH_SCHOOL";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["FAVORITE_TEACHER_HIGH_SCHOOL"] = 8] = "FAVORITE_TEACHER_HIGH_SCHOOL";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["FAVORITE_BAND"] = 9] = "FAVORITE_BAND";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["CHILDHOOD_SPORTS_HERO"] = 10] = "CHILDHOOD_SPORTS_HERO";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["COMPANY_FIRST_JOB"] = 11] = "COMPANY_FIRST_JOB";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["CHILD_NICKNAME"] = 12] = "CHILD_NICKNAME";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["NAME_FIRST_PARTNER"] = 13] = "NAME_FIRST_PARTNER";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["WHERE_MEET_PARTNER"] = 14] = "WHERE_MEET_PARTNER";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["MOTHER_MAIDEN_NAME"] = 15] = "MOTHER_MAIDEN_NAME";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["MATERNAL_GRANDMOTHER_FULL_NAME"] = 16] = "MATERNAL_GRANDMOTHER_FULL_NAME";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["PARENTAL_GRANDMOTHER_FULL_NAME"] = 17] = "PARENTAL_GRANDMOTHER_FULL_NAME";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["NAME_OLDEST_COUSIN"] = 18] = "NAME_OLDEST_COUSIN";
  WalletBackup_Recovery_QuestionEnum2[WalletBackup_Recovery_QuestionEnum2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
  return WalletBackup_Recovery_QuestionEnum2;
})(WalletBackup_Recovery_QuestionEnum || {});
function walletBackup_Recovery_QuestionEnumFromJSON(object) {
  switch (object) {
    case 0:
    case "FAVORITE_BOOK":
      return 0 /* FAVORITE_BOOK */;
    case 1:
    case "FIRST_PET":
      return 1 /* FIRST_PET */;
    case 2:
    case "WHERE_HIGH_SCHOOL_COLLEGE":
      return 2 /* WHERE_HIGH_SCHOOL_COLLEGE */;
    case 3:
    case "CITY_OF_BIRTH":
      return 3 /* CITY_OF_BIRTH */;
    case 4:
    case "FAVORITE_CHILDHOOD_FRIEND":
      return 4 /* FAVORITE_CHILDHOOD_FRIEND */;
    case 5:
    case "WHERE_FATHER_AND_MOTHER_MET":
      return 5 /* WHERE_FATHER_AND_MOTHER_MET */;
    case 6:
    case "FAVORITE_MOVIE":
      return 6 /* FAVORITE_MOVIE */;
    case 7:
    case "FAVORITE_SPORT_HIGH_SCHOOL":
      return 7 /* FAVORITE_SPORT_HIGH_SCHOOL */;
    case 8:
    case "FAVORITE_TEACHER_HIGH_SCHOOL":
      return 8 /* FAVORITE_TEACHER_HIGH_SCHOOL */;
    case 9:
    case "FAVORITE_BAND":
      return 9 /* FAVORITE_BAND */;
    case 10:
    case "CHILDHOOD_SPORTS_HERO":
      return 10 /* CHILDHOOD_SPORTS_HERO */;
    case 11:
    case "COMPANY_FIRST_JOB":
      return 11 /* COMPANY_FIRST_JOB */;
    case 12:
    case "CHILD_NICKNAME":
      return 12 /* CHILD_NICKNAME */;
    case 13:
    case "NAME_FIRST_PARTNER":
      return 13 /* NAME_FIRST_PARTNER */;
    case 14:
    case "WHERE_MEET_PARTNER":
      return 14 /* WHERE_MEET_PARTNER */;
    case 15:
    case "MOTHER_MAIDEN_NAME":
      return 15 /* MOTHER_MAIDEN_NAME */;
    case 16:
    case "MATERNAL_GRANDMOTHER_FULL_NAME":
      return 16 /* MATERNAL_GRANDMOTHER_FULL_NAME */;
    case 17:
    case "PARENTAL_GRANDMOTHER_FULL_NAME":
      return 17 /* PARENTAL_GRANDMOTHER_FULL_NAME */;
    case 18:
    case "NAME_OLDEST_COUSIN":
      return 18 /* NAME_OLDEST_COUSIN */;
    case -1:
    case "UNRECOGNIZED":
    default:
      return -1 /* UNRECOGNIZED */;
  }
}
function walletBackup_Recovery_QuestionEnumToJSON(object) {
  switch (object) {
    case 0 /* FAVORITE_BOOK */:
      return "FAVORITE_BOOK";
    case 1 /* FIRST_PET */:
      return "FIRST_PET";
    case 2 /* WHERE_HIGH_SCHOOL_COLLEGE */:
      return "WHERE_HIGH_SCHOOL_COLLEGE";
    case 3 /* CITY_OF_BIRTH */:
      return "CITY_OF_BIRTH";
    case 4 /* FAVORITE_CHILDHOOD_FRIEND */:
      return "FAVORITE_CHILDHOOD_FRIEND";
    case 5 /* WHERE_FATHER_AND_MOTHER_MET */:
      return "WHERE_FATHER_AND_MOTHER_MET";
    case 6 /* FAVORITE_MOVIE */:
      return "FAVORITE_MOVIE";
    case 7 /* FAVORITE_SPORT_HIGH_SCHOOL */:
      return "FAVORITE_SPORT_HIGH_SCHOOL";
    case 8 /* FAVORITE_TEACHER_HIGH_SCHOOL */:
      return "FAVORITE_TEACHER_HIGH_SCHOOL";
    case 9 /* FAVORITE_BAND */:
      return "FAVORITE_BAND";
    case 10 /* CHILDHOOD_SPORTS_HERO */:
      return "CHILDHOOD_SPORTS_HERO";
    case 11 /* COMPANY_FIRST_JOB */:
      return "COMPANY_FIRST_JOB";
    case 12 /* CHILD_NICKNAME */:
      return "CHILD_NICKNAME";
    case 13 /* NAME_FIRST_PARTNER */:
      return "NAME_FIRST_PARTNER";
    case 14 /* WHERE_MEET_PARTNER */:
      return "WHERE_MEET_PARTNER";
    case 15 /* MOTHER_MAIDEN_NAME */:
      return "MOTHER_MAIDEN_NAME";
    case 16 /* MATERNAL_GRANDMOTHER_FULL_NAME */:
      return "MATERNAL_GRANDMOTHER_FULL_NAME";
    case 17 /* PARENTAL_GRANDMOTHER_FULL_NAME */:
      return "PARENTAL_GRANDMOTHER_FULL_NAME";
    case 18 /* NAME_OLDEST_COUSIN */:
      return "NAME_OLDEST_COUSIN";
    case -1 /* UNRECOGNIZED */:
    default:
      return "UNRECOGNIZED";
  }
}
function createBaseWalletBackup() {
  return { name: "", timestamp: 0, wallet: void 0, passphraseRecovery: void 0 };
}
var WalletBackup = {
  encode(message, writer = import_minimal4.default.Writer.create()) {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.timestamp !== 0) {
      writer.uint32(16).uint64(message.timestamp);
    }
    if (message.wallet !== void 0) {
      Wallet.encode(message.wallet, writer.uint32(26).fork()).ldelim();
    }
    if (message.passphraseRecovery !== void 0) {
      WalletBackup_Recovery.encode(message.passphraseRecovery, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal4.default.Reader ? input : import_minimal4.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWalletBackup();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.timestamp = longToNumber(reader.uint64());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.wallet = Wallet.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.passphraseRecovery = WalletBackup_Recovery.decode(reader, reader.uint32());
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
      name: isSet4(object.name) ? globalThis.String(object.name) : "",
      timestamp: isSet4(object.timestamp) ? globalThis.Number(object.timestamp) : 0,
      wallet: isSet4(object.wallet) ? Wallet.fromJSON(object.wallet) : void 0,
      passphraseRecovery: isSet4(object.passphraseRecovery) ? WalletBackup_Recovery.fromJSON(object.passphraseRecovery) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.timestamp !== 0) {
      obj.timestamp = Math.round(message.timestamp);
    }
    if (message.wallet !== void 0) {
      obj.wallet = Wallet.toJSON(message.wallet);
    }
    if (message.passphraseRecovery !== void 0) {
      obj.passphraseRecovery = WalletBackup_Recovery.toJSON(message.passphraseRecovery);
    }
    return obj;
  },
  create(base) {
    return WalletBackup.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWalletBackup();
    message.name = object.name ?? "";
    message.timestamp = object.timestamp ?? 0;
    message.wallet = object.wallet !== void 0 && object.wallet !== null ? Wallet.fromPartial(object.wallet) : void 0;
    message.passphraseRecovery = object.passphraseRecovery !== void 0 && object.passphraseRecovery !== null ? WalletBackup_Recovery.fromPartial(object.passphraseRecovery) : void 0;
    return message;
  }
};
function createBaseWalletBackup_Recovery() {
  return { questionIds: [], encryptedPassphrase: new Uint8Array(0) };
}
var WalletBackup_Recovery = {
  encode(message, writer = import_minimal4.default.Writer.create()) {
    writer.uint32(10).fork();
    for (const v of message.questionIds) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.encryptedPassphrase.length !== 0) {
      writer.uint32(18).bytes(message.encryptedPassphrase);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal4.default.Reader ? input : import_minimal4.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseWalletBackup_Recovery();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.questionIds.push(reader.int32());
            continue;
          }
          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.questionIds.push(reader.int32());
            }
            continue;
          }
          break;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.encryptedPassphrase = reader.bytes();
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
      questionIds: globalThis.Array.isArray(object?.questionIds) ? object.questionIds.map((e) => walletBackup_Recovery_QuestionEnumFromJSON(e)) : [],
      encryptedPassphrase: isSet4(object.encryptedPassphrase) ? bytesFromBase642(object.encryptedPassphrase) : new Uint8Array(0)
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.questionIds?.length) {
      obj.questionIds = message.questionIds.map((e) => walletBackup_Recovery_QuestionEnumToJSON(e));
    }
    if (message.encryptedPassphrase.length !== 0) {
      obj.encryptedPassphrase = base64FromBytes2(message.encryptedPassphrase);
    }
    return obj;
  },
  create(base) {
    return WalletBackup_Recovery.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseWalletBackup_Recovery();
    message.questionIds = object.questionIds?.map((e) => e) || [];
    message.encryptedPassphrase = object.encryptedPassphrase ?? new Uint8Array(0);
    return message;
  }
};
function bytesFromBase642(b64) {
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
function base64FromBytes2(arr) {
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
if (import_minimal4.default.util.Long !== import_long.default) {
  import_minimal4.default.util.Long = import_long.default;
  import_minimal4.default.configure();
}
function isSet4(value) {
  return value !== null && value !== void 0;
}

// build/ts/client-store/gateway.ts
var gateway_exports = {};
__export(gateway_exports, {
  BootNodeGateways: () => BootNodeGateways,
  BootNodeGateways_MetaEntry: () => BootNodeGateways_MetaEntry,
  BootNodeGateways_NetworkNodes: () => BootNodeGateways_NetworkNodes,
  BootNodeGateways_NetworkNodes_DVote: () => BootNodeGateways_NetworkNodes_DVote,
  BootNodeGateways_NetworkNodes_Web3: () => BootNodeGateways_NetworkNodes_Web3
});
var import_minimal5 = __toESM(require_minimal2());
function createBaseBootNodeGateways() {
  return { homestead: void 0, goerli: void 0, xdai: void 0, sokol: void 0, rinkeby: void 0, meta: {} };
}
var BootNodeGateways = {
  encode(message, writer = import_minimal5.default.Writer.create()) {
    if (message.homestead !== void 0) {
      BootNodeGateways_NetworkNodes.encode(message.homestead, writer.uint32(10).fork()).ldelim();
    }
    if (message.goerli !== void 0) {
      BootNodeGateways_NetworkNodes.encode(message.goerli, writer.uint32(18).fork()).ldelim();
    }
    if (message.xdai !== void 0) {
      BootNodeGateways_NetworkNodes.encode(message.xdai, writer.uint32(26).fork()).ldelim();
    }
    if (message.sokol !== void 0) {
      BootNodeGateways_NetworkNodes.encode(message.sokol, writer.uint32(34).fork()).ldelim();
    }
    if (message.rinkeby !== void 0) {
      BootNodeGateways_NetworkNodes.encode(message.rinkeby, writer.uint32(42).fork()).ldelim();
    }
    Object.entries(message.meta).forEach(([key, value]) => {
      BootNodeGateways_MetaEntry.encode({ key, value }, writer.uint32(802).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal5.default.Reader ? input : import_minimal5.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseBootNodeGateways();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.homestead = BootNodeGateways_NetworkNodes.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.goerli = BootNodeGateways_NetworkNodes.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.xdai = BootNodeGateways_NetworkNodes.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.sokol = BootNodeGateways_NetworkNodes.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.rinkeby = BootNodeGateways_NetworkNodes.decode(reader, reader.uint32());
          continue;
        case 100:
          if (tag !== 802) {
            break;
          }
          const entry100 = BootNodeGateways_MetaEntry.decode(reader, reader.uint32());
          if (entry100.value !== void 0) {
            message.meta[entry100.key] = entry100.value;
          }
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
      homestead: isSet5(object.homestead) ? BootNodeGateways_NetworkNodes.fromJSON(object.homestead) : void 0,
      goerli: isSet5(object.goerli) ? BootNodeGateways_NetworkNodes.fromJSON(object.goerli) : void 0,
      xdai: isSet5(object.xdai) ? BootNodeGateways_NetworkNodes.fromJSON(object.xdai) : void 0,
      sokol: isSet5(object.sokol) ? BootNodeGateways_NetworkNodes.fromJSON(object.sokol) : void 0,
      rinkeby: isSet5(object.rinkeby) ? BootNodeGateways_NetworkNodes.fromJSON(object.rinkeby) : void 0,
      meta: isObject2(object.meta) ? Object.entries(object.meta).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {}
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.homestead !== void 0) {
      obj.homestead = BootNodeGateways_NetworkNodes.toJSON(message.homestead);
    }
    if (message.goerli !== void 0) {
      obj.goerli = BootNodeGateways_NetworkNodes.toJSON(message.goerli);
    }
    if (message.xdai !== void 0) {
      obj.xdai = BootNodeGateways_NetworkNodes.toJSON(message.xdai);
    }
    if (message.sokol !== void 0) {
      obj.sokol = BootNodeGateways_NetworkNodes.toJSON(message.sokol);
    }
    if (message.rinkeby !== void 0) {
      obj.rinkeby = BootNodeGateways_NetworkNodes.toJSON(message.rinkeby);
    }
    if (message.meta) {
      const entries = Object.entries(message.meta);
      if (entries.length > 0) {
        obj.meta = {};
        entries.forEach(([k, v]) => {
          obj.meta[k] = v;
        });
      }
    }
    return obj;
  },
  create(base) {
    return BootNodeGateways.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseBootNodeGateways();
    message.homestead = object.homestead !== void 0 && object.homestead !== null ? BootNodeGateways_NetworkNodes.fromPartial(object.homestead) : void 0;
    message.goerli = object.goerli !== void 0 && object.goerli !== null ? BootNodeGateways_NetworkNodes.fromPartial(object.goerli) : void 0;
    message.xdai = object.xdai !== void 0 && object.xdai !== null ? BootNodeGateways_NetworkNodes.fromPartial(object.xdai) : void 0;
    message.sokol = object.sokol !== void 0 && object.sokol !== null ? BootNodeGateways_NetworkNodes.fromPartial(object.sokol) : void 0;
    message.rinkeby = object.rinkeby !== void 0 && object.rinkeby !== null ? BootNodeGateways_NetworkNodes.fromPartial(object.rinkeby) : void 0;
    message.meta = Object.entries(object.meta ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    return message;
  }
};
function createBaseBootNodeGateways_NetworkNodes() {
  return { dvote: [], web3: [] };
}
var BootNodeGateways_NetworkNodes = {
  encode(message, writer = import_minimal5.default.Writer.create()) {
    for (const v of message.dvote) {
      BootNodeGateways_NetworkNodes_DVote.encode(v, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.web3) {
      BootNodeGateways_NetworkNodes_Web3.encode(v, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal5.default.Reader ? input : import_minimal5.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseBootNodeGateways_NetworkNodes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.dvote.push(BootNodeGateways_NetworkNodes_DVote.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.web3.push(BootNodeGateways_NetworkNodes_Web3.decode(reader, reader.uint32()));
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
      dvote: globalThis.Array.isArray(object?.dvote) ? object.dvote.map((e) => BootNodeGateways_NetworkNodes_DVote.fromJSON(e)) : [],
      web3: globalThis.Array.isArray(object?.web3) ? object.web3.map((e) => BootNodeGateways_NetworkNodes_Web3.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.dvote?.length) {
      obj.dvote = message.dvote.map((e) => BootNodeGateways_NetworkNodes_DVote.toJSON(e));
    }
    if (message.web3?.length) {
      obj.web3 = message.web3.map((e) => BootNodeGateways_NetworkNodes_Web3.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return BootNodeGateways_NetworkNodes.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseBootNodeGateways_NetworkNodes();
    message.dvote = object.dvote?.map((e) => BootNodeGateways_NetworkNodes_DVote.fromPartial(e)) || [];
    message.web3 = object.web3?.map((e) => BootNodeGateways_NetworkNodes_Web3.fromPartial(e)) || [];
    return message;
  }
};
function createBaseBootNodeGateways_NetworkNodes_DVote() {
  return { uri: "", apis: [], pubKey: "" };
}
var BootNodeGateways_NetworkNodes_DVote = {
  encode(message, writer = import_minimal5.default.Writer.create()) {
    if (message.uri !== "") {
      writer.uint32(10).string(message.uri);
    }
    for (const v of message.apis) {
      writer.uint32(18).string(v);
    }
    if (message.pubKey !== "") {
      writer.uint32(26).string(message.pubKey);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal5.default.Reader ? input : import_minimal5.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseBootNodeGateways_NetworkNodes_DVote();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.uri = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.apis.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.pubKey = reader.string();
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
      uri: isSet5(object.uri) ? globalThis.String(object.uri) : "",
      apis: globalThis.Array.isArray(object?.apis) ? object.apis.map((e) => globalThis.String(e)) : [],
      pubKey: isSet5(object.pubKey) ? globalThis.String(object.pubKey) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.uri !== "") {
      obj.uri = message.uri;
    }
    if (message.apis?.length) {
      obj.apis = message.apis;
    }
    if (message.pubKey !== "") {
      obj.pubKey = message.pubKey;
    }
    return obj;
  },
  create(base) {
    return BootNodeGateways_NetworkNodes_DVote.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseBootNodeGateways_NetworkNodes_DVote();
    message.uri = object.uri ?? "";
    message.apis = object.apis?.map((e) => e) || [];
    message.pubKey = object.pubKey ?? "";
    return message;
  }
};
function createBaseBootNodeGateways_NetworkNodes_Web3() {
  return { uri: "" };
}
var BootNodeGateways_NetworkNodes_Web3 = {
  encode(message, writer = import_minimal5.default.Writer.create()) {
    if (message.uri !== "") {
      writer.uint32(10).string(message.uri);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal5.default.Reader ? input : import_minimal5.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseBootNodeGateways_NetworkNodes_Web3();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.uri = reader.string();
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
    return { uri: isSet5(object.uri) ? globalThis.String(object.uri) : "" };
  },
  toJSON(message) {
    const obj = {};
    if (message.uri !== "") {
      obj.uri = message.uri;
    }
    return obj;
  },
  create(base) {
    return BootNodeGateways_NetworkNodes_Web3.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseBootNodeGateways_NetworkNodes_Web3();
    message.uri = object.uri ?? "";
    return message;
  }
};
function createBaseBootNodeGateways_MetaEntry() {
  return { key: "", value: "" };
}
var BootNodeGateways_MetaEntry = {
  encode(message, writer = import_minimal5.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal5.default.Reader ? input : import_minimal5.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseBootNodeGateways_MetaEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.value = reader.string();
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
      key: isSet5(object.key) ? globalThis.String(object.key) : "",
      value: isSet5(object.value) ? globalThis.String(object.value) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },
  create(base) {
    return BootNodeGateways_MetaEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseBootNodeGateways_MetaEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function isObject2(value) {
  return typeof value === "object" && value !== null;
}
function isSet5(value) {
  return value !== null && value !== void 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Account,
  Backup,
  Gateway,
  Wallet
});
