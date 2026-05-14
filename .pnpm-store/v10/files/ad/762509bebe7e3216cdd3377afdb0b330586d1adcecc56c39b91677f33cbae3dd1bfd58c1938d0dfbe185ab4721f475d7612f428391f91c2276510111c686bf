"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.by639_2B = exports.by639_2T = exports.by639_1 = exports.codes = void 0;

var _data = _interopRequireDefault(require("./data"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var codes = [],
    by639_1 = {},
    by639_2T = {},
    by639_2B = {};
exports.by639_2B = by639_2B;
exports.by639_2T = by639_2T;
exports.by639_1 = by639_1;
exports.codes = codes;

_data["default"].forEach(function (row) {
  var code = {
    name: row[0],
    nativeName: row[1],
    iso639_1: row[2],
    iso639_2T: row[3],
    iso639_2B: row[4]
  };
  by639_1[row[2]] = by639_2T[row[3]] = by639_2B[row[4]] = code;
  codes.push(code);
});

var _default = codes;
exports["default"] = _default;