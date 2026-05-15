var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
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
    util.isObject = function isObject4(value) {
      return value && typeof value === "object";
    };
    util.isset = /**
     * Checks if a property on a message is considered to be present.
     * @param {Object} obj Plain object or message instance
     * @param {string} prop Property name
     * @returns {boolean} `true` if considered to be present, otherwise `false`
     */
    util.isSet = function isSet4(obj, prop) {
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

// build/ts/metadata/entity.ts
var import_minimal = __toESM(require_minimal2());
function createBaseEntityMetadataStore() {
  return { items: [] };
}
var EntityMetadataStore = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    for (const v of message.items) {
      EntityMetadata.encode(v, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadataStore();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.items.push(EntityMetadata.decode(reader, reader.uint32()));
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
      items: globalThis.Array.isArray(object?.items) ? object.items.map((e) => EntityMetadata.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.items?.length) {
      obj.items = message.items.map((e) => EntityMetadata.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return EntityMetadataStore.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadataStore();
    message.items = object.items?.map((e) => EntityMetadata.fromPartial(e)) || [];
    return message;
  }
};
function createBaseEntityMetadata() {
  return {
    version: "",
    languages: [],
    name: {},
    description: {},
    votingProcesses: void 0,
    newsFeed: {},
    media: void 0,
    actions: [],
    bootEntities: [],
    fallbackBootNodeEntities: [],
    trustedEntities: [],
    censusServiceManagedEntities: [],
    meta: {}
  };
}
var EntityMetadata = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.version !== "") {
      writer.uint32(10).string(message.version);
    }
    for (const v of message.languages) {
      writer.uint32(18).string(v);
    }
    Object.entries(message.name).forEach(([key, value]) => {
      EntityMetadata_NameEntry.encode({ key, value }, writer.uint32(26).fork()).ldelim();
    });
    Object.entries(message.description).forEach(([key, value]) => {
      EntityMetadata_DescriptionEntry.encode({ key, value }, writer.uint32(34).fork()).ldelim();
    });
    if (message.votingProcesses !== void 0) {
      EntityMetadata_VotingProcesses.encode(message.votingProcesses, writer.uint32(42).fork()).ldelim();
    }
    Object.entries(message.newsFeed).forEach(([key, value]) => {
      EntityMetadata_NewsFeedEntry.encode({ key, value }, writer.uint32(50).fork()).ldelim();
    });
    if (message.media !== void 0) {
      EntityMetadata_Media.encode(message.media, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.actions) {
      EntityMetadata_Action.encode(v, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.bootEntities) {
      EntityReference.encode(v, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.fallbackBootNodeEntities) {
      EntityReference.encode(v, writer.uint32(82).fork()).ldelim();
    }
    for (const v of message.trustedEntities) {
      EntityReference.encode(v, writer.uint32(90).fork()).ldelim();
    }
    for (const v of message.censusServiceManagedEntities) {
      EntityReference.encode(v, writer.uint32(98).fork()).ldelim();
    }
    Object.entries(message.meta).forEach(([key, value]) => {
      EntityMetadata_MetaEntry.encode({ key, value }, writer.uint32(802).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.version = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.languages.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          const entry3 = EntityMetadata_NameEntry.decode(reader, reader.uint32());
          if (entry3.value !== void 0) {
            message.name[entry3.key] = entry3.value;
          }
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          const entry4 = EntityMetadata_DescriptionEntry.decode(reader, reader.uint32());
          if (entry4.value !== void 0) {
            message.description[entry4.key] = entry4.value;
          }
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.votingProcesses = EntityMetadata_VotingProcesses.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          const entry6 = EntityMetadata_NewsFeedEntry.decode(reader, reader.uint32());
          if (entry6.value !== void 0) {
            message.newsFeed[entry6.key] = entry6.value;
          }
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.media = EntityMetadata_Media.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }
          message.actions.push(EntityMetadata_Action.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.bootEntities.push(EntityReference.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }
          message.fallbackBootNodeEntities.push(EntityReference.decode(reader, reader.uint32()));
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }
          message.trustedEntities.push(EntityReference.decode(reader, reader.uint32()));
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }
          message.censusServiceManagedEntities.push(EntityReference.decode(reader, reader.uint32()));
          continue;
        case 100:
          if (tag !== 802) {
            break;
          }
          const entry100 = EntityMetadata_MetaEntry.decode(reader, reader.uint32());
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
      version: isSet(object.version) ? globalThis.String(object.version) : "",
      languages: globalThis.Array.isArray(object?.languages) ? object.languages.map((e) => globalThis.String(e)) : [],
      name: isObject(object.name) ? Object.entries(object.name).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {},
      description: isObject(object.description) ? Object.entries(object.description).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {},
      votingProcesses: isSet(object.votingProcesses) ? EntityMetadata_VotingProcesses.fromJSON(object.votingProcesses) : void 0,
      newsFeed: isObject(object.newsFeed) ? Object.entries(object.newsFeed).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {},
      media: isSet(object.media) ? EntityMetadata_Media.fromJSON(object.media) : void 0,
      actions: globalThis.Array.isArray(object?.actions) ? object.actions.map((e) => EntityMetadata_Action.fromJSON(e)) : [],
      bootEntities: globalThis.Array.isArray(object?.bootEntities) ? object.bootEntities.map((e) => EntityReference.fromJSON(e)) : [],
      fallbackBootNodeEntities: globalThis.Array.isArray(object?.fallbackBootNodeEntities) ? object.fallbackBootNodeEntities.map((e) => EntityReference.fromJSON(e)) : [],
      trustedEntities: globalThis.Array.isArray(object?.trustedEntities) ? object.trustedEntities.map((e) => EntityReference.fromJSON(e)) : [],
      censusServiceManagedEntities: globalThis.Array.isArray(object?.censusServiceManagedEntities) ? object.censusServiceManagedEntities.map((e) => EntityReference.fromJSON(e)) : [],
      meta: isObject(object.meta) ? Object.entries(object.meta).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {}
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.version !== "") {
      obj.version = message.version;
    }
    if (message.languages?.length) {
      obj.languages = message.languages;
    }
    if (message.name) {
      const entries = Object.entries(message.name);
      if (entries.length > 0) {
        obj.name = {};
        entries.forEach(([k, v]) => {
          obj.name[k] = v;
        });
      }
    }
    if (message.description) {
      const entries = Object.entries(message.description);
      if (entries.length > 0) {
        obj.description = {};
        entries.forEach(([k, v]) => {
          obj.description[k] = v;
        });
      }
    }
    if (message.votingProcesses !== void 0) {
      obj.votingProcesses = EntityMetadata_VotingProcesses.toJSON(message.votingProcesses);
    }
    if (message.newsFeed) {
      const entries = Object.entries(message.newsFeed);
      if (entries.length > 0) {
        obj.newsFeed = {};
        entries.forEach(([k, v]) => {
          obj.newsFeed[k] = v;
        });
      }
    }
    if (message.media !== void 0) {
      obj.media = EntityMetadata_Media.toJSON(message.media);
    }
    if (message.actions?.length) {
      obj.actions = message.actions.map((e) => EntityMetadata_Action.toJSON(e));
    }
    if (message.bootEntities?.length) {
      obj.bootEntities = message.bootEntities.map((e) => EntityReference.toJSON(e));
    }
    if (message.fallbackBootNodeEntities?.length) {
      obj.fallbackBootNodeEntities = message.fallbackBootNodeEntities.map((e) => EntityReference.toJSON(e));
    }
    if (message.trustedEntities?.length) {
      obj.trustedEntities = message.trustedEntities.map((e) => EntityReference.toJSON(e));
    }
    if (message.censusServiceManagedEntities?.length) {
      obj.censusServiceManagedEntities = message.censusServiceManagedEntities.map((e) => EntityReference.toJSON(e));
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
    return EntityMetadata.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata();
    message.version = object.version ?? "";
    message.languages = object.languages?.map((e) => e) || [];
    message.name = Object.entries(object.name ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    message.description = Object.entries(object.description ?? {}).reduce(
      (acc, [key, value]) => {
        if (value !== void 0) {
          acc[key] = globalThis.String(value);
        }
        return acc;
      },
      {}
    );
    message.votingProcesses = object.votingProcesses !== void 0 && object.votingProcesses !== null ? EntityMetadata_VotingProcesses.fromPartial(object.votingProcesses) : void 0;
    message.newsFeed = Object.entries(object.newsFeed ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    message.media = object.media !== void 0 && object.media !== null ? EntityMetadata_Media.fromPartial(object.media) : void 0;
    message.actions = object.actions?.map((e) => EntityMetadata_Action.fromPartial(e)) || [];
    message.bootEntities = object.bootEntities?.map((e) => EntityReference.fromPartial(e)) || [];
    message.fallbackBootNodeEntities = object.fallbackBootNodeEntities?.map((e) => EntityReference.fromPartial(e)) || [];
    message.trustedEntities = object.trustedEntities?.map((e) => EntityReference.fromPartial(e)) || [];
    message.censusServiceManagedEntities = object.censusServiceManagedEntities?.map((e) => EntityReference.fromPartial(e)) || [];
    message.meta = Object.entries(object.meta ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    return message;
  }
};
function createBaseEntityMetadata_NameEntry() {
  return { key: "", value: "" };
}
var EntityMetadata_NameEntry = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata_NameEntry();
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
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : ""
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
    return EntityMetadata_NameEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata_NameEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseEntityMetadata_DescriptionEntry() {
  return { key: "", value: "" };
}
var EntityMetadata_DescriptionEntry = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata_DescriptionEntry();
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
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : ""
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
    return EntityMetadata_DescriptionEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata_DescriptionEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseEntityMetadata_VotingProcesses() {
  return { active: [], ended: [] };
}
var EntityMetadata_VotingProcesses = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    for (const v of message.active) {
      writer.uint32(10).string(v);
    }
    for (const v of message.ended) {
      writer.uint32(18).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata_VotingProcesses();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.active.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.ended.push(reader.string());
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
      active: globalThis.Array.isArray(object?.active) ? object.active.map((e) => globalThis.String(e)) : [],
      ended: globalThis.Array.isArray(object?.ended) ? object.ended.map((e) => globalThis.String(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.active?.length) {
      obj.active = message.active;
    }
    if (message.ended?.length) {
      obj.ended = message.ended;
    }
    return obj;
  },
  create(base) {
    return EntityMetadata_VotingProcesses.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata_VotingProcesses();
    message.active = object.active?.map((e) => e) || [];
    message.ended = object.ended?.map((e) => e) || [];
    return message;
  }
};
function createBaseEntityMetadata_NewsFeedEntry() {
  return { key: "", value: "" };
}
var EntityMetadata_NewsFeedEntry = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata_NewsFeedEntry();
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
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : ""
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
    return EntityMetadata_NewsFeedEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata_NewsFeedEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseEntityMetadata_Media() {
  return { avatar: "", header: "" };
}
var EntityMetadata_Media = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.avatar !== "") {
      writer.uint32(10).string(message.avatar);
    }
    if (message.header !== "") {
      writer.uint32(18).string(message.header);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata_Media();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.avatar = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.header = reader.string();
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
      avatar: isSet(object.avatar) ? globalThis.String(object.avatar) : "",
      header: isSet(object.header) ? globalThis.String(object.header) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.avatar !== "") {
      obj.avatar = message.avatar;
    }
    if (message.header !== "") {
      obj.header = message.header;
    }
    return obj;
  },
  create(base) {
    return EntityMetadata_Media.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata_Media();
    message.avatar = object.avatar ?? "";
    message.header = object.header ?? "";
    return message;
  }
};
function createBaseEntityMetadata_Action() {
  return { type: "", actionKey: "", name: {}, visible: "", url: "", imageSources: [] };
}
var EntityMetadata_Action = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.actionKey !== "") {
      writer.uint32(58).string(message.actionKey);
    }
    Object.entries(message.name).forEach(([key, value]) => {
      EntityMetadata_Action_NameEntry.encode({ key, value }, writer.uint32(18).fork()).ldelim();
    });
    if (message.visible !== "") {
      writer.uint32(26).string(message.visible);
    }
    if (message.url !== "") {
      writer.uint32(34).string(message.url);
    }
    for (const v of message.imageSources) {
      EntityMetadata_Action_ImageSource.encode(v, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata_Action();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.type = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.actionKey = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          const entry2 = EntityMetadata_Action_NameEntry.decode(reader, reader.uint32());
          if (entry2.value !== void 0) {
            message.name[entry2.key] = entry2.value;
          }
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.visible = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.url = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.imageSources.push(EntityMetadata_Action_ImageSource.decode(reader, reader.uint32()));
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
      type: isSet(object.type) ? globalThis.String(object.type) : "",
      actionKey: isSet(object.actionKey) ? globalThis.String(object.actionKey) : "",
      name: isObject(object.name) ? Object.entries(object.name).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {},
      visible: isSet(object.visible) ? globalThis.String(object.visible) : "",
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      imageSources: globalThis.Array.isArray(object?.imageSources) ? object.imageSources.map((e) => EntityMetadata_Action_ImageSource.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.type !== "") {
      obj.type = message.type;
    }
    if (message.actionKey !== "") {
      obj.actionKey = message.actionKey;
    }
    if (message.name) {
      const entries = Object.entries(message.name);
      if (entries.length > 0) {
        obj.name = {};
        entries.forEach(([k, v]) => {
          obj.name[k] = v;
        });
      }
    }
    if (message.visible !== "") {
      obj.visible = message.visible;
    }
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.imageSources?.length) {
      obj.imageSources = message.imageSources.map((e) => EntityMetadata_Action_ImageSource.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return EntityMetadata_Action.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata_Action();
    message.type = object.type ?? "";
    message.actionKey = object.actionKey ?? "";
    message.name = Object.entries(object.name ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    message.visible = object.visible ?? "";
    message.url = object.url ?? "";
    message.imageSources = object.imageSources?.map((e) => EntityMetadata_Action_ImageSource.fromPartial(e)) || [];
    return message;
  }
};
function createBaseEntityMetadata_Action_NameEntry() {
  return { key: "", value: "" };
}
var EntityMetadata_Action_NameEntry = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata_Action_NameEntry();
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
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : ""
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
    return EntityMetadata_Action_NameEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata_Action_NameEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseEntityMetadata_Action_ImageSource() {
  return { type: "", name: "", orientation: "", overlay: "", caption: {} };
}
var EntityMetadata_Action_ImageSource = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.orientation !== "") {
      writer.uint32(26).string(message.orientation);
    }
    if (message.overlay !== "") {
      writer.uint32(34).string(message.overlay);
    }
    Object.entries(message.caption).forEach(([key, value]) => {
      EntityMetadata_Action_ImageSource_CaptionEntry.encode({ key, value }, writer.uint32(42).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata_Action_ImageSource();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.type = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.orientation = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.overlay = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          const entry5 = EntityMetadata_Action_ImageSource_CaptionEntry.decode(reader, reader.uint32());
          if (entry5.value !== void 0) {
            message.caption[entry5.key] = entry5.value;
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
      type: isSet(object.type) ? globalThis.String(object.type) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      orientation: isSet(object.orientation) ? globalThis.String(object.orientation) : "",
      overlay: isSet(object.overlay) ? globalThis.String(object.overlay) : "",
      caption: isObject(object.caption) ? Object.entries(object.caption).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {}
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.type !== "") {
      obj.type = message.type;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.orientation !== "") {
      obj.orientation = message.orientation;
    }
    if (message.overlay !== "") {
      obj.overlay = message.overlay;
    }
    if (message.caption) {
      const entries = Object.entries(message.caption);
      if (entries.length > 0) {
        obj.caption = {};
        entries.forEach(([k, v]) => {
          obj.caption[k] = v;
        });
      }
    }
    return obj;
  },
  create(base) {
    return EntityMetadata_Action_ImageSource.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata_Action_ImageSource();
    message.type = object.type ?? "";
    message.name = object.name ?? "";
    message.orientation = object.orientation ?? "";
    message.overlay = object.overlay ?? "";
    message.caption = Object.entries(object.caption ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    return message;
  }
};
function createBaseEntityMetadata_Action_ImageSource_CaptionEntry() {
  return { key: "", value: "" };
}
var EntityMetadata_Action_ImageSource_CaptionEntry = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata_Action_ImageSource_CaptionEntry();
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
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : ""
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
    return EntityMetadata_Action_ImageSource_CaptionEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata_Action_ImageSource_CaptionEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseEntityMetadata_MetaEntry() {
  return { key: "", value: "" };
}
var EntityMetadata_MetaEntry = {
  encode(message, writer = import_minimal.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal.default.Reader ? input : import_minimal.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseEntityMetadata_MetaEntry();
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
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : ""
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
    return EntityMetadata_MetaEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseEntityMetadata_MetaEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
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
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isSet(value) {
  return value !== null && value !== void 0;
}

// build/ts/metadata/feed.ts
var import_minimal2 = __toESM(require_minimal2());
function createBaseFeedStore() {
  return { items: [] };
}
var FeedStore = {
  encode(message, writer = import_minimal2.default.Writer.create()) {
    for (const v of message.items) {
      Feed.encode(v, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal2.default.Reader ? input : import_minimal2.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFeedStore();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.items.push(Feed.decode(reader, reader.uint32()));
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
    return { items: globalThis.Array.isArray(object?.items) ? object.items.map((e) => Feed.fromJSON(e)) : [] };
  },
  toJSON(message) {
    const obj = {};
    if (message.items?.length) {
      obj.items = message.items.map((e) => Feed.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return FeedStore.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFeedStore();
    message.items = object.items?.map((e) => Feed.fromPartial(e)) || [];
    return message;
  }
};
function createBaseFeed() {
  return {
    version: "",
    title: "",
    homePageUrl: "",
    description: "",
    feedUrl: "",
    icon: "",
    favicon: "",
    expired: false,
    items: [],
    meta: {}
  };
}
var Feed = {
  encode(message, writer = import_minimal2.default.Writer.create()) {
    if (message.version !== "") {
      writer.uint32(10).string(message.version);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    if (message.homePageUrl !== "") {
      writer.uint32(26).string(message.homePageUrl);
    }
    if (message.description !== "") {
      writer.uint32(34).string(message.description);
    }
    if (message.feedUrl !== "") {
      writer.uint32(42).string(message.feedUrl);
    }
    if (message.icon !== "") {
      writer.uint32(50).string(message.icon);
    }
    if (message.favicon !== "") {
      writer.uint32(58).string(message.favicon);
    }
    if (message.expired !== false) {
      writer.uint32(64).bool(message.expired);
    }
    for (const v of message.items) {
      FeedPost.encode(v, writer.uint32(74).fork()).ldelim();
    }
    Object.entries(message.meta).forEach(([key, value]) => {
      Feed_MetaEntry.encode({ key, value }, writer.uint32(802).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal2.default.Reader ? input : import_minimal2.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFeed();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.version = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.title = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.homePageUrl = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.description = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.feedUrl = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.icon = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.favicon = reader.string();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }
          message.expired = reader.bool();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.items.push(FeedPost.decode(reader, reader.uint32()));
          continue;
        case 100:
          if (tag !== 802) {
            break;
          }
          const entry100 = Feed_MetaEntry.decode(reader, reader.uint32());
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
      version: isSet2(object.version) ? globalThis.String(object.version) : "",
      title: isSet2(object.title) ? globalThis.String(object.title) : "",
      homePageUrl: isSet2(object.homePageUrl) ? globalThis.String(object.homePageUrl) : "",
      description: isSet2(object.description) ? globalThis.String(object.description) : "",
      feedUrl: isSet2(object.feedUrl) ? globalThis.String(object.feedUrl) : "",
      icon: isSet2(object.icon) ? globalThis.String(object.icon) : "",
      favicon: isSet2(object.favicon) ? globalThis.String(object.favicon) : "",
      expired: isSet2(object.expired) ? globalThis.Boolean(object.expired) : false,
      items: globalThis.Array.isArray(object?.items) ? object.items.map((e) => FeedPost.fromJSON(e)) : [],
      meta: isObject2(object.meta) ? Object.entries(object.meta).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {}
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.version !== "") {
      obj.version = message.version;
    }
    if (message.title !== "") {
      obj.title = message.title;
    }
    if (message.homePageUrl !== "") {
      obj.homePageUrl = message.homePageUrl;
    }
    if (message.description !== "") {
      obj.description = message.description;
    }
    if (message.feedUrl !== "") {
      obj.feedUrl = message.feedUrl;
    }
    if (message.icon !== "") {
      obj.icon = message.icon;
    }
    if (message.favicon !== "") {
      obj.favicon = message.favicon;
    }
    if (message.expired !== false) {
      obj.expired = message.expired;
    }
    if (message.items?.length) {
      obj.items = message.items.map((e) => FeedPost.toJSON(e));
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
    return Feed.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFeed();
    message.version = object.version ?? "";
    message.title = object.title ?? "";
    message.homePageUrl = object.homePageUrl ?? "";
    message.description = object.description ?? "";
    message.feedUrl = object.feedUrl ?? "";
    message.icon = object.icon ?? "";
    message.favicon = object.favicon ?? "";
    message.expired = object.expired ?? false;
    message.items = object.items?.map((e) => FeedPost.fromPartial(e)) || [];
    message.meta = Object.entries(object.meta ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    return message;
  }
};
function createBaseFeed_MetaEntry() {
  return { key: "", value: "" };
}
var Feed_MetaEntry = {
  encode(message, writer = import_minimal2.default.Writer.create()) {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal2.default.Reader ? input : import_minimal2.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFeed_MetaEntry();
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
      key: isSet2(object.key) ? globalThis.String(object.key) : "",
      value: isSet2(object.value) ? globalThis.String(object.value) : ""
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
    return Feed_MetaEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFeed_MetaEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseFeedPost() {
  return {
    id: "",
    title: "",
    summary: "",
    contentText: "",
    contentHtml: "",
    url: "",
    image: "",
    tags: [],
    datePublished: "",
    dateModified: "",
    author: void 0
  };
}
var FeedPost = {
  encode(message, writer = import_minimal2.default.Writer.create()) {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    if (message.summary !== "") {
      writer.uint32(26).string(message.summary);
    }
    if (message.contentText !== "") {
      writer.uint32(34).string(message.contentText);
    }
    if (message.contentHtml !== "") {
      writer.uint32(42).string(message.contentHtml);
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.image !== "") {
      writer.uint32(58).string(message.image);
    }
    for (const v of message.tags) {
      writer.uint32(66).string(v);
    }
    if (message.datePublished !== "") {
      writer.uint32(74).string(message.datePublished);
    }
    if (message.dateModified !== "") {
      writer.uint32(82).string(message.dateModified);
    }
    if (message.author !== void 0) {
      FeedPost_Author.encode(message.author, writer.uint32(90).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal2.default.Reader ? input : import_minimal2.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFeedPost();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.title = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.summary = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          message.contentText = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.contentHtml = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.url = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }
          message.image = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }
          message.tags.push(reader.string());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }
          message.datePublished = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }
          message.dateModified = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }
          message.author = FeedPost_Author.decode(reader, reader.uint32());
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
      id: isSet2(object.id) ? globalThis.String(object.id) : "",
      title: isSet2(object.title) ? globalThis.String(object.title) : "",
      summary: isSet2(object.summary) ? globalThis.String(object.summary) : "",
      contentText: isSet2(object.contentText) ? globalThis.String(object.contentText) : "",
      contentHtml: isSet2(object.contentHtml) ? globalThis.String(object.contentHtml) : "",
      url: isSet2(object.url) ? globalThis.String(object.url) : "",
      image: isSet2(object.image) ? globalThis.String(object.image) : "",
      tags: globalThis.Array.isArray(object?.tags) ? object.tags.map((e) => globalThis.String(e)) : [],
      datePublished: isSet2(object.datePublished) ? globalThis.String(object.datePublished) : "",
      dateModified: isSet2(object.dateModified) ? globalThis.String(object.dateModified) : "",
      author: isSet2(object.author) ? FeedPost_Author.fromJSON(object.author) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.title !== "") {
      obj.title = message.title;
    }
    if (message.summary !== "") {
      obj.summary = message.summary;
    }
    if (message.contentText !== "") {
      obj.contentText = message.contentText;
    }
    if (message.contentHtml !== "") {
      obj.contentHtml = message.contentHtml;
    }
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.image !== "") {
      obj.image = message.image;
    }
    if (message.tags?.length) {
      obj.tags = message.tags;
    }
    if (message.datePublished !== "") {
      obj.datePublished = message.datePublished;
    }
    if (message.dateModified !== "") {
      obj.dateModified = message.dateModified;
    }
    if (message.author !== void 0) {
      obj.author = FeedPost_Author.toJSON(message.author);
    }
    return obj;
  },
  create(base) {
    return FeedPost.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFeedPost();
    message.id = object.id ?? "";
    message.title = object.title ?? "";
    message.summary = object.summary ?? "";
    message.contentText = object.contentText ?? "";
    message.contentHtml = object.contentHtml ?? "";
    message.url = object.url ?? "";
    message.image = object.image ?? "";
    message.tags = object.tags?.map((e) => e) || [];
    message.datePublished = object.datePublished ?? "";
    message.dateModified = object.dateModified ?? "";
    message.author = object.author !== void 0 && object.author !== null ? FeedPost_Author.fromPartial(object.author) : void 0;
    return message;
  }
};
function createBaseFeedPost_Author() {
  return { name: "", url: "" };
}
var FeedPost_Author = {
  encode(message, writer = import_minimal2.default.Writer.create()) {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.url !== "") {
      writer.uint32(18).string(message.url);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal2.default.Reader ? input : import_minimal2.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseFeedPost_Author();
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
          message.url = reader.string();
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
      name: isSet2(object.name) ? globalThis.String(object.name) : "",
      url: isSet2(object.url) ? globalThis.String(object.url) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.url !== "") {
      obj.url = message.url;
    }
    return obj;
  },
  create(base) {
    return FeedPost_Author.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseFeedPost_Author();
    message.name = object.name ?? "";
    message.url = object.url ?? "";
    return message;
  }
};
function isObject2(value) {
  return typeof value === "object" && value !== null;
}
function isSet2(value) {
  return value !== null && value !== void 0;
}

// build/ts/metadata/process.ts
var import_minimal3 = __toESM(require_minimal2());
function createBaseProcessMetadataStore() {
  return { items: [] };
}
var ProcessMetadataStore = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    for (const v of message.items) {
      ProcessMetadata.encode(v, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProcessMetadataStore();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.items.push(ProcessMetadata.decode(reader, reader.uint32()));
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
      items: globalThis.Array.isArray(object?.items) ? object.items.map((e) => ProcessMetadata.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.items?.length) {
      obj.items = message.items.map((e) => ProcessMetadata.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return ProcessMetadataStore.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadataStore();
    message.items = object.items?.map((e) => ProcessMetadata.fromPartial(e)) || [];
    return message;
  }
};
function createBaseProcessMetadata() {
  return { version: "", title: {}, description: {}, media: {}, questions: [], results: void 0, meta: {} };
}
var ProcessMetadata = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.version !== "") {
      writer.uint32(10).string(message.version);
    }
    Object.entries(message.title).forEach(([key, value]) => {
      ProcessMetadata_TitleEntry.encode({ key, value }, writer.uint32(18).fork()).ldelim();
    });
    Object.entries(message.description).forEach(([key, value]) => {
      ProcessMetadata_DescriptionEntry.encode({ key, value }, writer.uint32(26).fork()).ldelim();
    });
    Object.entries(message.media).forEach(([key, value]) => {
      ProcessMetadata_MediaEntry.encode({ key, value }, writer.uint32(34).fork()).ldelim();
    });
    for (const v of message.questions) {
      ProcessMetadata_Question.encode(v, writer.uint32(42).fork()).ldelim();
    }
    if (message.results !== void 0) {
      ProcessMetadata_Results.encode(message.results, writer.uint32(50).fork()).ldelim();
    }
    Object.entries(message.meta).forEach(([key, value]) => {
      ProcessMetadata_MetaEntry.encode({ key, value }, writer.uint32(802).fork()).ldelim();
    });
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProcessMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.version = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          const entry2 = ProcessMetadata_TitleEntry.decode(reader, reader.uint32());
          if (entry2.value !== void 0) {
            message.title[entry2.key] = entry2.value;
          }
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          const entry3 = ProcessMetadata_DescriptionEntry.decode(reader, reader.uint32());
          if (entry3.value !== void 0) {
            message.description[entry3.key] = entry3.value;
          }
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }
          const entry4 = ProcessMetadata_MediaEntry.decode(reader, reader.uint32());
          if (entry4.value !== void 0) {
            message.media[entry4.key] = entry4.value;
          }
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }
          message.questions.push(ProcessMetadata_Question.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }
          message.results = ProcessMetadata_Results.decode(reader, reader.uint32());
          continue;
        case 100:
          if (tag !== 802) {
            break;
          }
          const entry100 = ProcessMetadata_MetaEntry.decode(reader, reader.uint32());
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
      version: isSet3(object.version) ? globalThis.String(object.version) : "",
      title: isObject3(object.title) ? Object.entries(object.title).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {},
      description: isObject3(object.description) ? Object.entries(object.description).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {},
      media: isObject3(object.media) ? Object.entries(object.media).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {},
      questions: globalThis.Array.isArray(object?.questions) ? object.questions.map((e) => ProcessMetadata_Question.fromJSON(e)) : [],
      results: isSet3(object.results) ? ProcessMetadata_Results.fromJSON(object.results) : void 0,
      meta: isObject3(object.meta) ? Object.entries(object.meta).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {}
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.version !== "") {
      obj.version = message.version;
    }
    if (message.title) {
      const entries = Object.entries(message.title);
      if (entries.length > 0) {
        obj.title = {};
        entries.forEach(([k, v]) => {
          obj.title[k] = v;
        });
      }
    }
    if (message.description) {
      const entries = Object.entries(message.description);
      if (entries.length > 0) {
        obj.description = {};
        entries.forEach(([k, v]) => {
          obj.description[k] = v;
        });
      }
    }
    if (message.media) {
      const entries = Object.entries(message.media);
      if (entries.length > 0) {
        obj.media = {};
        entries.forEach(([k, v]) => {
          obj.media[k] = v;
        });
      }
    }
    if (message.questions?.length) {
      obj.questions = message.questions.map((e) => ProcessMetadata_Question.toJSON(e));
    }
    if (message.results !== void 0) {
      obj.results = ProcessMetadata_Results.toJSON(message.results);
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
    return ProcessMetadata.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata();
    message.version = object.version ?? "";
    message.title = Object.entries(object.title ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    message.description = Object.entries(object.description ?? {}).reduce(
      (acc, [key, value]) => {
        if (value !== void 0) {
          acc[key] = globalThis.String(value);
        }
        return acc;
      },
      {}
    );
    message.media = Object.entries(object.media ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    message.questions = object.questions?.map((e) => ProcessMetadata_Question.fromPartial(e)) || [];
    message.results = object.results !== void 0 && object.results !== null ? ProcessMetadata_Results.fromPartial(object.results) : void 0;
    message.meta = Object.entries(object.meta ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    return message;
  }
};
function createBaseProcessMetadata_TitleEntry() {
  return { key: "", value: "" };
}
var ProcessMetadata_TitleEntry = {
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
    const message = createBaseProcessMetadata_TitleEntry();
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
    return ProcessMetadata_TitleEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata_TitleEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseProcessMetadata_DescriptionEntry() {
  return { key: "", value: "" };
}
var ProcessMetadata_DescriptionEntry = {
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
    const message = createBaseProcessMetadata_DescriptionEntry();
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
    return ProcessMetadata_DescriptionEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata_DescriptionEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseProcessMetadata_MediaEntry() {
  return { key: "", value: "" };
}
var ProcessMetadata_MediaEntry = {
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
    const message = createBaseProcessMetadata_MediaEntry();
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
    return ProcessMetadata_MediaEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata_MediaEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseProcessMetadata_Question() {
  return { title: {}, description: {}, choices: [] };
}
var ProcessMetadata_Question = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    Object.entries(message.title).forEach(([key, value]) => {
      ProcessMetadata_Question_TitleEntry.encode({ key, value }, writer.uint32(10).fork()).ldelim();
    });
    Object.entries(message.description).forEach(([key, value]) => {
      ProcessMetadata_Question_DescriptionEntry.encode({ key, value }, writer.uint32(18).fork()).ldelim();
    });
    for (const v of message.choices) {
      ProcessMetadata_Question_VoteOption.encode(v, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProcessMetadata_Question();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          const entry1 = ProcessMetadata_Question_TitleEntry.decode(reader, reader.uint32());
          if (entry1.value !== void 0) {
            message.title[entry1.key] = entry1.value;
          }
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          const entry2 = ProcessMetadata_Question_DescriptionEntry.decode(reader, reader.uint32());
          if (entry2.value !== void 0) {
            message.description[entry2.key] = entry2.value;
          }
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }
          message.choices.push(ProcessMetadata_Question_VoteOption.decode(reader, reader.uint32()));
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
      title: isObject3(object.title) ? Object.entries(object.title).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {},
      description: isObject3(object.description) ? Object.entries(object.description).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {},
      choices: globalThis.Array.isArray(object?.choices) ? object.choices.map((e) => ProcessMetadata_Question_VoteOption.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.title) {
      const entries = Object.entries(message.title);
      if (entries.length > 0) {
        obj.title = {};
        entries.forEach(([k, v]) => {
          obj.title[k] = v;
        });
      }
    }
    if (message.description) {
      const entries = Object.entries(message.description);
      if (entries.length > 0) {
        obj.description = {};
        entries.forEach(([k, v]) => {
          obj.description[k] = v;
        });
      }
    }
    if (message.choices?.length) {
      obj.choices = message.choices.map((e) => ProcessMetadata_Question_VoteOption.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return ProcessMetadata_Question.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata_Question();
    message.title = Object.entries(object.title ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    message.description = Object.entries(object.description ?? {}).reduce(
      (acc, [key, value]) => {
        if (value !== void 0) {
          acc[key] = globalThis.String(value);
        }
        return acc;
      },
      {}
    );
    message.choices = object.choices?.map((e) => ProcessMetadata_Question_VoteOption.fromPartial(e)) || [];
    return message;
  }
};
function createBaseProcessMetadata_Question_TitleEntry() {
  return { key: "", value: "" };
}
var ProcessMetadata_Question_TitleEntry = {
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
    const message = createBaseProcessMetadata_Question_TitleEntry();
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
    return ProcessMetadata_Question_TitleEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata_Question_TitleEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseProcessMetadata_Question_DescriptionEntry() {
  return { key: "", value: "" };
}
var ProcessMetadata_Question_DescriptionEntry = {
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
    const message = createBaseProcessMetadata_Question_DescriptionEntry();
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
    return ProcessMetadata_Question_DescriptionEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata_Question_DescriptionEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseProcessMetadata_Question_VoteOption() {
  return { title: {}, value: 0 };
}
var ProcessMetadata_Question_VoteOption = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    Object.entries(message.title).forEach(([key, value]) => {
      ProcessMetadata_Question_VoteOption_TitleEntry.encode({ key, value }, writer.uint32(10).fork()).ldelim();
    });
    if (message.value !== 0) {
      writer.uint32(16).int32(message.value);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProcessMetadata_Question_VoteOption();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          const entry1 = ProcessMetadata_Question_VoteOption_TitleEntry.decode(reader, reader.uint32());
          if (entry1.value !== void 0) {
            message.title[entry1.key] = entry1.value;
          }
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }
          message.value = reader.int32();
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
      title: isObject3(object.title) ? Object.entries(object.title).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {}) : {},
      value: isSet3(object.value) ? globalThis.Number(object.value) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.title) {
      const entries = Object.entries(message.title);
      if (entries.length > 0) {
        obj.title = {};
        entries.forEach(([k, v]) => {
          obj.title[k] = v;
        });
      }
    }
    if (message.value !== 0) {
      obj.value = Math.round(message.value);
    }
    return obj;
  },
  create(base) {
    return ProcessMetadata_Question_VoteOption.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata_Question_VoteOption();
    message.title = Object.entries(object.title ?? {}).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    message.value = object.value ?? 0;
    return message;
  }
};
function createBaseProcessMetadata_Question_VoteOption_TitleEntry() {
  return { key: "", value: "" };
}
var ProcessMetadata_Question_VoteOption_TitleEntry = {
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
    const message = createBaseProcessMetadata_Question_VoteOption_TitleEntry();
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
    return ProcessMetadata_Question_VoteOption_TitleEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata_Question_VoteOption_TitleEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function createBaseProcessMetadata_Results() {
  return { aggregation: "", display: "" };
}
var ProcessMetadata_Results = {
  encode(message, writer = import_minimal3.default.Writer.create()) {
    if (message.aggregation !== "") {
      writer.uint32(10).string(message.aggregation);
    }
    if (message.display !== "") {
      writer.uint32(18).string(message.display);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof import_minimal3.default.Reader ? input : import_minimal3.default.Reader.create(input);
    let end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseProcessMetadata_Results();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }
          message.aggregation = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }
          message.display = reader.string();
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
      aggregation: isSet3(object.aggregation) ? globalThis.String(object.aggregation) : "",
      display: isSet3(object.display) ? globalThis.String(object.display) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.aggregation !== "") {
      obj.aggregation = message.aggregation;
    }
    if (message.display !== "") {
      obj.display = message.display;
    }
    return obj;
  },
  create(base) {
    return ProcessMetadata_Results.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata_Results();
    message.aggregation = object.aggregation ?? "";
    message.display = object.display ?? "";
    return message;
  }
};
function createBaseProcessMetadata_MetaEntry() {
  return { key: "", value: "" };
}
var ProcessMetadata_MetaEntry = {
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
    const message = createBaseProcessMetadata_MetaEntry();
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
    return ProcessMetadata_MetaEntry.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseProcessMetadata_MetaEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }
};
function isObject3(value) {
  return typeof value === "object" && value !== null;
}
function isSet3(value) {
  return value !== null && value !== void 0;
}
export {
  EntityMetadata,
  EntityMetadataStore,
  EntityMetadata_Action,
  EntityMetadata_Action_ImageSource,
  EntityMetadata_Action_ImageSource_CaptionEntry,
  EntityMetadata_Action_NameEntry,
  EntityMetadata_DescriptionEntry,
  EntityMetadata_Media,
  EntityMetadata_MetaEntry,
  EntityMetadata_NameEntry,
  EntityMetadata_NewsFeedEntry,
  EntityMetadata_VotingProcesses,
  EntityReference,
  Feed,
  FeedPost,
  FeedPost_Author,
  FeedStore,
  Feed_MetaEntry,
  ProcessMetadata,
  ProcessMetadataStore,
  ProcessMetadata_DescriptionEntry,
  ProcessMetadata_MediaEntry,
  ProcessMetadata_MetaEntry,
  ProcessMetadata_Question,
  ProcessMetadata_Question_DescriptionEntry,
  ProcessMetadata_Question_TitleEntry,
  ProcessMetadata_Question_VoteOption,
  ProcessMetadata_Question_VoteOption_TitleEntry,
  ProcessMetadata_Results,
  ProcessMetadata_TitleEntry
};
