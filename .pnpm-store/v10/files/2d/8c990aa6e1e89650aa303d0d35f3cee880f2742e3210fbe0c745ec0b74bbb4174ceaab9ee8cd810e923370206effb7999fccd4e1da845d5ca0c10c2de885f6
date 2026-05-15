'use strict';

var config = require('./config.js');
var extractor = require('./extractor/core/extractor.js');
var keyFinder = require('./extractor/core/key-finder.js');
var translationManager = require('./extractor/core/translation-manager.js');
require('./extractor/parsers/jsx-parser.js');
var linter = require('./linter.js');
var syncer = require('./syncer.js');
var status = require('./status.js');
var typesGenerator = require('./types-generator.js');
var renameKey = require('./rename-key.js');



exports.defineConfig = config.defineConfig;
exports.extract = extractor.extract;
exports.runExtractor = extractor.runExtractor;
exports.findKeys = keyFinder.findKeys;
exports.getTranslations = translationManager.getTranslations;
exports.recommendedAcceptedAttributes = linter.recommendedAcceptedAttributes;
exports.recommendedAcceptedTags = linter.recommendedAcceptedTags;
exports.runLinter = linter.runLinter;
exports.runSyncer = syncer.runSyncer;
exports.runStatus = status.runStatus;
exports.runTypesGenerator = typesGenerator.runTypesGenerator;
exports.runRenameKey = renameKey.runRenameKey;
