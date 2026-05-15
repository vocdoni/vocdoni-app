function toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}

function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == typeof i ? i : String(i);
}

function _defineProperty(obj, key, value) {
  key = toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}

var createSprinkles = composeStyles => function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  var sprinklesStyles = Object.assign({}, ...args.map(a => a.styles));
  var sprinklesKeys = Object.keys(sprinklesStyles);
  var shorthandNames = sprinklesKeys.filter(property => 'mappings' in sprinklesStyles[property]);
  var sprinklesFn = props => {
    var classNames = [];
    var shorthands = {};
    var nonShorthands = _objectSpread2({}, props);
    var hasShorthands = false;
    for (var shorthand of shorthandNames) {
      var value = props[shorthand];
      if (value != null) {
        var sprinkle = sprinklesStyles[shorthand];
        hasShorthands = true;
        for (var propMapping of sprinkle.mappings) {
          shorthands[propMapping] = value;
          if (nonShorthands[propMapping] == null) {
            delete nonShorthands[propMapping];
          }
        }
      }
    }
    var finalProps = hasShorthands ? _objectSpread2(_objectSpread2({}, shorthands), nonShorthands) : props;
    var _loop = function _loop() {
      var propValue = finalProps[prop];
      var sprinkle = sprinklesStyles[prop];
      try {
        if (sprinkle.mappings) {
          // Skip shorthands
          return 1; // continue
        }
        if (typeof propValue === 'string' || typeof propValue === 'number') {
          if (process.env.NODE_ENV !== 'production') {
            if (!sprinkle.values[propValue].defaultClass) {
              throw new Error();
            }
          }
          classNames.push(sprinkle.values[propValue].defaultClass);
        } else if (Array.isArray(propValue)) {
          for (var responsiveIndex = 0; responsiveIndex < propValue.length; responsiveIndex++) {
            var responsiveValue = propValue[responsiveIndex];
            if (responsiveValue != null) {
              var conditionName = sprinkle.responsiveArray[responsiveIndex];
              if (process.env.NODE_ENV !== 'production') {
                if (!sprinkle.values[responsiveValue].conditions[conditionName]) {
                  throw new Error();
                }
              }
              classNames.push(sprinkle.values[responsiveValue].conditions[conditionName]);
            }
          }
        } else {
          for (var _conditionName in propValue) {
            // Conditional style
            var _value = propValue[_conditionName];
            if (_value != null) {
              if (process.env.NODE_ENV !== 'production') {
                if (!sprinkle.values[_value].conditions[_conditionName]) {
                  throw new Error();
                }
              }
              classNames.push(sprinkle.values[_value].conditions[_conditionName]);
            }
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          class SprinklesError extends Error {
            constructor(message) {
              super(message);
              this.name = 'SprinklesError';
            }
          }
          var format = v => typeof v === 'string' ? "\"".concat(v, "\"") : v;
          var invalidPropValue = (prop, value, possibleValues) => {
            throw new SprinklesError("\"".concat(prop, "\" has no value ").concat(format(value), ". Possible values are ").concat(Object.keys(possibleValues).map(format).join(', ')));
          };
          if (!sprinkle) {
            throw new SprinklesError("\"".concat(prop, "\" is not a valid sprinkle"));
          }
          if (typeof propValue === 'string' || typeof propValue === 'number') {
            if (!(propValue in sprinkle.values)) {
              invalidPropValue(prop, propValue, sprinkle.values);
            }
            if (!sprinkle.values[propValue].defaultClass) {
              throw new SprinklesError("\"".concat(prop, "\" has no default condition. You must specify which conditions to target explicitly. Possible options are ").concat(Object.keys(sprinkle.values[propValue].conditions).map(format).join(', ')));
            }
          }
          if (typeof propValue === 'object') {
            if (!('conditions' in sprinkle.values[Object.keys(sprinkle.values)[0]])) {
              throw new SprinklesError("\"".concat(prop, "\" is not a conditional property"));
            }
            if (Array.isArray(propValue)) {
              if (!('responsiveArray' in sprinkle)) {
                throw new SprinklesError("\"".concat(prop, "\" does not support responsive arrays"));
              }
              var breakpointCount = sprinkle.responsiveArray.length;
              if (breakpointCount < propValue.length) {
                throw new SprinklesError("\"".concat(prop, "\" only supports up to ").concat(breakpointCount, " breakpoints. You passed ").concat(propValue.length));
              }
              for (var _responsiveValue of propValue) {
                if (!sprinkle.values[_responsiveValue]) {
                  invalidPropValue(prop, _responsiveValue, sprinkle.values);
                }
              }
            } else {
              for (var _conditionName2 in propValue) {
                var _value2 = propValue[_conditionName2];
                if (_value2 != null) {
                  if (!sprinkle.values[_value2]) {
                    invalidPropValue(prop, _value2, sprinkle.values);
                  }
                  if (!sprinkle.values[_value2].conditions[_conditionName2]) {
                    throw new SprinklesError("\"".concat(prop, "\" has no condition named ").concat(format(_conditionName2), ". Possible values are ").concat(Object.keys(sprinkle.values[_value2].conditions).map(format).join(', ')));
                  }
                }
              }
            }
          }
        }
        throw e;
      }
    };
    for (var prop in finalProps) {
      if (_loop()) continue;
    }
    return composeStyles(classNames.join(' '));
  };
  return Object.assign(sprinklesFn, {
    properties: new Set(sprinklesKeys)
  });
};

export { createSprinkles as c };
