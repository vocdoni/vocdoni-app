"use strict";
'use strict';

var presetBase = require('./preset-base.cjs');
var mergeConfig = require('./styled-system/merge-config.cjs');
var system = require('./styled-system/system.cjs');
var index = require('./theme/index.cjs');

const defaultConfig = mergeConfig.mergeConfigs(presetBase.defaultBaseConfig, index.defaultThemeConfig);
const defaultSystem = system.createSystem(defaultConfig);

exports.defaultConfig = defaultConfig;
exports.defaultSystem = defaultSystem;
exports.system = defaultSystem;
