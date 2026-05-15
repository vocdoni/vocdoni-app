//#region src/VerboseLevel.ts
/**
* Logging levels for the CTA-608 parser.
*
*
* @enum
*
* @beta
*/
const VerboseLevel = {
	ERROR: 0,
	TEXT: 1,
	WARNING: 2,
	INFO: 2,
	DEBUG: 3,
	DATA: 3
};

//#endregion
//#region src/CaptionsLogger.ts
/**
* CaptionsLogger. To be removed in the future.
*
* @beta
*/
var CaptionsLogger = class {
	constructor() {
		this.time = null;
		this.verboseLevel = VerboseLevel.ERROR;
	}
	log(severity, msg) {
		if (this.verboseLevel >= severity) {
			const m = typeof msg === "function" ? msg() : msg;
			console.log(`${this.time} [${severity}] ${m}`);
		}
	}
};

//#endregion
//#region src/PenState.ts
/**
* Pen state.
*
* @beta
*/
var PenState = class {
	constructor() {
		this.foreground = "white";
		this.underline = false;
		this.italics = false;
		this.background = "black";
		this.flash = false;
	}
	reset() {
		this.foreground = "white";
		this.underline = false;
		this.italics = false;
		this.background = "black";
		this.flash = false;
	}
	setStyles(styles) {
		for (const style of [
			"foreground",
			"underline",
			"italics",
			"background",
			"flash"
		]) if (Object.prototype.hasOwnProperty.call(styles, style)) this[style] = styles[style];
	}
	isDefault() {
		return this.foreground === "white" && !this.underline && !this.italics && this.background === "black" && !this.flash;
	}
	equals(other) {
		return this.foreground === other.foreground && this.underline === other.underline && this.italics === other.italics && this.background === other.background && this.flash === other.flash;
	}
	copy(newPenState) {
		this.foreground = newPenState.foreground;
		this.underline = newPenState.underline;
		this.italics = newPenState.italics;
		this.background = newPenState.background;
		this.flash = newPenState.flash;
	}
};

//#endregion
//#region src/StyledUnicodeChar.ts
/**
* Unicode character with styling and background.
*
* @beta
*/
var StyledUnicodeChar = class {
	constructor() {
		this.uchar = " ";
		this.penState = new PenState();
	}
	reset() {
		this.uchar = " ";
		this.penState.reset();
	}
	setChar(uchar, newPenState) {
		this.uchar = uchar;
		this.penState.copy(newPenState);
	}
	setPenState(newPenState) {
		this.penState.copy(newPenState);
	}
	equals(other) {
		return this.uchar === other.uchar && this.penState.equals(other.penState);
	}
	copy(newChar) {
		this.uchar = newChar.uchar;
		this.penState.copy(newChar.penState);
	}
	isEmpty() {
		return this.uchar === " " && this.penState.isDefault();
	}
};

//#endregion
//#region src/utils/NR_COLS.ts
const NR_COLS = 100;

//#endregion
//#region src/utils/specialCea608CharsCodes.ts
/**
*  Exceptions from regular ASCII. CodePoints are mapped to UTF-16 codes
*/
const specialCea608CharsCodes = {
	42: 225,
	92: 233,
	94: 237,
	95: 243,
	96: 250,
	123: 231,
	124: 247,
	125: 209,
	126: 241,
	127: 9608,
	128: 174,
	129: 176,
	130: 189,
	131: 191,
	132: 8482,
	133: 162,
	134: 163,
	135: 9834,
	136: 224,
	137: 32,
	138: 232,
	139: 226,
	140: 234,
	141: 238,
	142: 244,
	143: 251,
	144: 193,
	145: 201,
	146: 211,
	147: 218,
	148: 220,
	149: 252,
	150: 8216,
	151: 161,
	152: 42,
	153: 8217,
	154: 9473,
	155: 169,
	156: 8480,
	157: 8226,
	158: 8220,
	159: 8221,
	160: 192,
	161: 194,
	162: 199,
	163: 200,
	164: 202,
	165: 203,
	166: 235,
	167: 206,
	168: 207,
	169: 239,
	170: 212,
	171: 217,
	172: 249,
	173: 219,
	174: 171,
	175: 187,
	176: 195,
	177: 227,
	178: 205,
	179: 204,
	180: 236,
	181: 210,
	182: 242,
	183: 213,
	184: 245,
	185: 123,
	186: 125,
	187: 92,
	188: 94,
	189: 95,
	190: 124,
	191: 8764,
	192: 196,
	193: 228,
	194: 214,
	195: 246,
	196: 223,
	197: 165,
	198: 164,
	199: 9475,
	200: 197,
	201: 229,
	202: 216,
	203: 248,
	204: 9487,
	205: 9491,
	206: 9495,
	207: 9499
};

//#endregion
//#region src/utils/getCharForByte.ts
function getCharForByte(byte) {
	return String.fromCharCode(specialCea608CharsCodes[byte] || byte);
}

//#endregion
//#region src/Row.ts
/**
* CTA-608 row consisting of NR_COLS instances of StyledUnicodeChar.
*
* @beta
*/
var Row = class {
	constructor(logger = new CaptionsLogger()) {
		this.chars = [];
		this.cueStartTime = null;
		this.pos = 0;
		this.currPenState = new PenState();
		for (let i = 0; i < NR_COLS; i++) this.chars.push(new StyledUnicodeChar());
		this.logger = logger;
	}
	equals(other) {
		for (let i = 0; i < NR_COLS; i++) if (!this.chars[i].equals(other.chars[i])) return false;
		return true;
	}
	copy(other) {
		for (let i = 0; i < NR_COLS; i++) this.chars[i].copy(other.chars[i]);
	}
	isEmpty() {
		let empty = true;
		for (let i = 0; i < NR_COLS; i++) if (!this.chars[i].isEmpty()) {
			empty = false;
			break;
		}
		return empty;
	}
	/**
	*  Set the cursor to a valid column.
	*/
	setCursor(absPos) {
		if (this.pos !== absPos) this.pos = absPos;
		if (this.pos < 0) {
			this.logger.log(VerboseLevel.DEBUG, "Negative cursor position " + this.pos);
			this.pos = 0;
		} else if (this.pos > NR_COLS) {
			this.logger.log(VerboseLevel.DEBUG, "Too large cursor position " + this.pos);
			this.pos = NR_COLS;
		}
	}
	/**
	* Move the cursor relative to current position.
	*/
	moveCursor(relPos) {
		const newPos = this.pos + relPos;
		if (relPos > 1) for (let i = this.pos + 1; i < newPos + 1; i++) this.chars[i].setPenState(this.currPenState);
		this.setCursor(newPos);
	}
	/**
	* Backspace, move one step back and clear character.
	*/
	backSpace() {
		this.moveCursor(-1);
		this.chars[this.pos].setChar(" ", this.currPenState);
	}
	insertChar(byte) {
		if (byte >= 144) this.backSpace();
		const char = getCharForByte(byte);
		if (this.pos >= NR_COLS) {
			this.logger.log(VerboseLevel.ERROR, () => "Cannot insert " + byte.toString(16) + " (" + char + ") at position " + this.pos + ". Skipping it!");
			return;
		}
		this.chars[this.pos].setChar(char, this.currPenState);
		this.moveCursor(1);
	}
	clearFromPos(startPos) {
		let i;
		for (i = startPos; i < NR_COLS; i++) this.chars[i].reset();
	}
	clear() {
		this.clearFromPos(0);
		this.pos = 0;
		this.currPenState.reset();
	}
	clearToEndOfRow() {
		this.clearFromPos(this.pos);
	}
	getTextString() {
		const chars = [];
		let empty = true;
		for (let i = 0; i < NR_COLS; i++) {
			const char = this.chars[i].uchar;
			if (char !== " ") empty = false;
			chars.push(char);
		}
		if (empty) return "";
		else return chars.join("");
	}
	setPenStyles(styles) {
		this.currPenState.setStyles(styles);
		this.chars[this.pos].setPenState(this.currPenState);
	}
};

//#endregion
//#region src/utils/NR_ROWS.ts
const NR_ROWS = 15;

//#endregion
//#region src/CaptionScreen.ts
/**
* Keep a CTA-608 screen of 32x15 styled characters
*
* @beta
*/
var CaptionScreen = class {
	constructor(logger = new CaptionsLogger()) {
		this.rows = [];
		this.currRow = NR_ROWS - 1;
		this.nrRollUpRows = null;
		this.lastOutputScreen = null;
		for (let i = 0; i < NR_ROWS; i++) this.rows.push(new Row(logger));
		this.logger = logger;
	}
	reset() {
		for (let i = 0; i < NR_ROWS; i++) this.rows[i].clear();
		this.currRow = NR_ROWS - 1;
	}
	equals(other) {
		let equal = true;
		for (let i = 0; i < NR_ROWS; i++) if (!this.rows[i].equals(other.rows[i])) {
			equal = false;
			break;
		}
		return equal;
	}
	copy(other) {
		for (let i = 0; i < NR_ROWS; i++) this.rows[i].copy(other.rows[i]);
	}
	isEmpty() {
		let empty = true;
		for (let i = 0; i < NR_ROWS; i++) if (!this.rows[i].isEmpty()) {
			empty = false;
			break;
		}
		return empty;
	}
	backSpace() {
		this.rows[this.currRow].backSpace();
	}
	clearToEndOfRow() {
		this.rows[this.currRow].clearToEndOfRow();
	}
	/**
	* Insert a character (without styling) in the current row.
	*/
	insertChar(char) {
		this.rows[this.currRow].insertChar(char);
	}
	setPen(styles) {
		this.rows[this.currRow].setPenStyles(styles);
	}
	moveCursor(relPos) {
		this.rows[this.currRow].moveCursor(relPos);
	}
	setCursor(absPos) {
		this.logger.log(VerboseLevel.INFO, "setCursor: " + absPos);
		this.rows[this.currRow].setCursor(absPos);
	}
	setPAC(pacData) {
		this.logger.log(VerboseLevel.INFO, () => "pacData = " + JSON.stringify(pacData));
		let newRow = pacData.row - 1;
		if (this.nrRollUpRows && newRow < this.nrRollUpRows - 1) newRow = this.nrRollUpRows - 1;
		if (this.nrRollUpRows && this.currRow !== newRow) {
			for (let i = 0; i < NR_ROWS; i++) this.rows[i].clear();
			const topRowIndex = this.currRow + 1 - this.nrRollUpRows;
			const lastOutputScreen = this.lastOutputScreen;
			if (lastOutputScreen) {
				const prevLineTime = lastOutputScreen.rows[topRowIndex].cueStartTime;
				const time = this.logger.time;
				if (prevLineTime !== null && time !== null && prevLineTime < time) for (let i = 0; i < this.nrRollUpRows; i++) this.rows[newRow - this.nrRollUpRows + i + 1].copy(lastOutputScreen.rows[topRowIndex + i]);
			}
		}
		this.currRow = newRow;
		const row = this.rows[this.currRow];
		if (pacData.indent !== null) {
			const indent = pacData.indent;
			const prevPos = Math.max(indent - 1, 0);
			row.setCursor(pacData.indent);
			pacData.color = row.chars[prevPos].penState.foreground;
		}
		const styles = {
			foreground: pacData.color,
			underline: pacData.underline,
			italics: pacData.italics,
			background: "black",
			flash: false
		};
		this.setPen(styles);
	}
	/**
	* Set background/extra foreground, but first do back_space, and then insert space (backwards compatibility).
	*/
	setBkgData(bkgData) {
		this.logger.log(VerboseLevel.INFO, () => "bkgData = " + JSON.stringify(bkgData));
		this.backSpace();
		this.setPen(bkgData);
		this.insertChar(32);
	}
	setRollUpRows(nrRows) {
		this.nrRollUpRows = nrRows;
	}
	rollUp() {
		if (this.nrRollUpRows === null) {
			this.logger.log(VerboseLevel.DEBUG, "roll_up but nrRollUpRows not set yet");
			return;
		}
		this.logger.log(VerboseLevel.TEXT, () => this.getDisplayText());
		const topRowIndex = this.currRow + 1 - this.nrRollUpRows;
		const topRow = this.rows.splice(topRowIndex, 1)[0];
		topRow.clear();
		this.rows.splice(this.currRow, 0, topRow);
		this.logger.log(VerboseLevel.INFO, "Rolling up");
	}
	/**
	* Get all non-empty rows with as unicode text.
	*/
	getDisplayText(asOneRow) {
		asOneRow = asOneRow || false;
		const displayText = [];
		let text = "";
		let rowNr = -1;
		for (let i = 0; i < NR_ROWS; i++) {
			const rowText = this.rows[i].getTextString();
			if (rowText) {
				rowNr = i + 1;
				if (asOneRow) displayText.push("Row " + rowNr + ": '" + rowText + "'");
				else displayText.push(rowText.trim());
			}
		}
		if (displayText.length > 0) if (asOneRow) text = "[" + displayText.join(" | ") + "]";
		else text = displayText.join("\n");
		return text;
	}
	getTextAndFormat() {
		return this.rows;
	}
};

//#endregion
//#region src/Cta608Channel.ts
/**
* CTA-608 Channel
*
* @beta
*/
var Cta608Channel = class {
	constructor(channelNumber, outputFilter, logger = new CaptionsLogger()) {
		this.chNr = channelNumber;
		this.outputFilter = outputFilter;
		this.mode = null;
		this.displayedMemory = new CaptionScreen(logger);
		this.nonDisplayedMemory = new CaptionScreen(logger);
		this.lastOutputScreen = new CaptionScreen(logger);
		this.currRollUpRow = this.displayedMemory.rows[NR_ROWS - 1];
		this.writeScreen = this.displayedMemory;
		this.mode = null;
		this.cueStartTime = null;
		this.logger = logger;
		this.logger.log(VerboseLevel.INFO, "new Cea608Channel(" + this.chNr + ")");
	}
	reset() {
		this.mode = null;
		this.displayedMemory.reset();
		this.nonDisplayedMemory.reset();
		this.lastOutputScreen.reset();
		this.outputFilter?.reset?.();
		this.currRollUpRow = this.displayedMemory.rows[NR_ROWS - 1];
		this.writeScreen = this.displayedMemory;
		this.mode = null;
		this.cueStartTime = null;
	}
	getHandler() {
		return this.outputFilter;
	}
	setHandler(outputFilter) {
		this.outputFilter = outputFilter;
	}
	setPAC(pacData) {
		this.writeScreen.setPAC(pacData);
	}
	setBkgData(bkgData) {
		this.writeScreen.setBkgData(bkgData);
	}
	setMode(newMode) {
		if (newMode === this.mode) return;
		this.mode = newMode;
		this.logger.log(VerboseLevel.INFO, () => "MODE=" + newMode);
		if (this.mode === "MODE_POP-ON") this.writeScreen = this.nonDisplayedMemory;
		else {
			this.writeScreen = this.displayedMemory;
			this.writeScreen.reset();
		}
		if (this.mode !== "MODE_ROLL-UP") {
			this.displayedMemory.setRollUpRows(null);
			this.nonDisplayedMemory.setRollUpRows(null);
		}
		this.mode = newMode;
	}
	insertChars(chars) {
		for (const char of chars) this.writeScreen.insertChar(char);
		const screen = this.writeScreen === this.displayedMemory ? "DISP" : "NON_DISP";
		this.logger.log(VerboseLevel.INFO, () => screen + ": " + this.writeScreen.getDisplayText(true));
		if (this.mode === "MODE_PAINT-ON" || this.mode === "MODE_ROLL-UP") {
			this.logger.log(VerboseLevel.TEXT, () => "DISPLAYED: " + this.displayedMemory.getDisplayText(true));
			this.outputDataUpdate();
		}
	}
	ccRCL() {
		this.logger.log(VerboseLevel.INFO, "RCL - Resume Caption Loading");
		this.setMode("MODE_POP-ON");
	}
	ccBS() {
		this.logger.log(VerboseLevel.INFO, "BS - BackSpace");
		if (this.mode === "MODE_TEXT") return;
		this.writeScreen.backSpace();
		if (this.writeScreen === this.displayedMemory) this.outputDataUpdate();
	}
	ccAOF() {}
	ccAON() {}
	ccDER() {
		this.logger.log(VerboseLevel.INFO, "DER- Delete to End of Row");
		this.writeScreen.clearToEndOfRow();
		this.outputDataUpdate();
	}
	ccRU(nrRows) {
		this.logger.log(VerboseLevel.INFO, "RU(" + nrRows + ") - Roll Up");
		this.writeScreen = this.displayedMemory;
		this.setMode("MODE_ROLL-UP");
		this.writeScreen.setRollUpRows(nrRows);
	}
	ccFON() {
		this.logger.log(VerboseLevel.INFO, "FON - Flash On");
		this.writeScreen.setPen({ flash: true });
	}
	ccRDC() {
		this.logger.log(VerboseLevel.INFO, "RDC - Resume Direct Captioning");
		this.setMode("MODE_PAINT-ON");
	}
	ccTR() {
		this.logger.log(VerboseLevel.INFO, "TR");
		this.setMode("MODE_TEXT");
	}
	ccRTD() {
		this.logger.log(VerboseLevel.INFO, "RTD");
		this.setMode("MODE_TEXT");
	}
	ccEDM() {
		this.logger.log(VerboseLevel.INFO, "EDM - Erase Displayed Memory");
		this.displayedMemory.reset();
		this.outputDataUpdate(true);
	}
	ccCR() {
		this.logger.log(VerboseLevel.INFO, "CR - Carriage Return");
		this.writeScreen.rollUp();
		this.outputDataUpdate(true);
	}
	ccENM() {
		this.logger.log(VerboseLevel.INFO, "ENM - Erase Non-displayed Memory");
		this.nonDisplayedMemory.reset();
	}
	ccEOC() {
		this.logger.log(VerboseLevel.INFO, "EOC - End Of Caption");
		if (this.mode === "MODE_POP-ON") {
			const tmp = this.displayedMemory;
			this.displayedMemory = this.nonDisplayedMemory;
			this.nonDisplayedMemory = tmp;
			this.writeScreen = this.nonDisplayedMemory;
			this.logger.log(VerboseLevel.TEXT, () => "DISP: " + this.displayedMemory.getDisplayText());
		}
		this.outputDataUpdate(true);
	}
	ccTO(nrCols) {
		this.logger.log(VerboseLevel.INFO, "TO(" + nrCols + ") - Tab Offset");
		this.writeScreen.moveCursor(nrCols);
	}
	ccMIDROW(secondByte) {
		const styles = { flash: false };
		styles.underline = secondByte % 2 === 1;
		styles.italics = secondByte >= 46;
		if (!styles.italics) styles.foreground = [
			"white",
			"green",
			"blue",
			"cyan",
			"red",
			"yellow",
			"magenta"
		][Math.floor(secondByte / 2) - 16];
		else styles.foreground = "white";
		this.logger.log(VerboseLevel.INFO, "MIDROW: " + JSON.stringify(styles));
		this.writeScreen.setPen(styles);
	}
	outputDataUpdate(dispatch = false) {
		const time = this.logger.time;
		if (time === null) return;
		if (this.outputFilter) {
			if (this.cueStartTime === null && !this.displayedMemory.isEmpty()) this.cueStartTime = time;
			else if (!this.displayedMemory.equals(this.lastOutputScreen)) {
				this.outputFilter.newCue(this.cueStartTime, time, this.lastOutputScreen);
				if (dispatch && this.outputFilter.dispatchCue) this.outputFilter.dispatchCue();
				this.cueStartTime = this.displayedMemory.isEmpty() ? null : time;
			}
			this.lastOutputScreen.copy(this.displayedMemory);
		}
	}
	cueSplitAtTime(t) {
		if (this.outputFilter) {
			if (!this.displayedMemory.isEmpty()) {
				if (this.outputFilter.newCue) this.outputFilter.newCue(this.cueStartTime, t, this.displayedMemory);
				this.cueStartTime = t;
			}
		}
	}
};

//#endregion
//#region src/utils/backgroundColors.ts
const backgroundColors = [
	"white",
	"green",
	"blue",
	"cyan",
	"red",
	"yellow",
	"magenta",
	"black",
	"transparent"
];

//#endregion
//#region src/utils/createCmdHistory.ts
function createCmdHistory() {
	return {
		a: null,
		b: null
	};
}

//#endregion
//#region src/utils/hasCmdRepeated.ts
function hasCmdRepeated(a, b, cmdHistory) {
	return cmdHistory.a === a && cmdHistory.b === b;
}

//#endregion
//#region src/utils/numArrayToHexArray.ts
function numArrayToHexArray(numArray) {
	const hexArray = [];
	for (const num of numArray) hexArray.push(num.toString(16));
	return hexArray;
}

//#endregion
//#region src/utils/rowsHighCh1.ts
const rowsHighCh1 = {
	17: 2,
	18: 4,
	21: 6,
	22: 8,
	23: 10,
	19: 13,
	20: 15
};

//#endregion
//#region src/utils/rowsHighCh2.ts
const rowsHighCh2 = {
	25: 2,
	26: 4,
	29: 6,
	30: 8,
	31: 10,
	27: 13,
	28: 15
};

//#endregion
//#region src/utils/rowsLowCh1.ts
const rowsLowCh1 = {
	17: 1,
	18: 3,
	21: 5,
	22: 7,
	23: 9,
	16: 11,
	19: 12,
	20: 14
};

//#endregion
//#region src/utils/rowsLowCh2.ts
const rowsLowCh2 = {
	25: 1,
	26: 3,
	29: 5,
	30: 7,
	31: 9,
	24: 11,
	27: 12,
	28: 14
};

//#endregion
//#region src/utils/setLastCmd.ts
function setLastCmd(a, b, cmdHistory) {
	cmdHistory.a = a;
	cmdHistory.b = b;
}

//#endregion
//#region src/Cta608Parser.ts
/**
* CEA-608 caption parser.
*
* @beta
*/
var Cta608Parser = class {
	constructor(field, out1, out2) {
		this.currentChannel = 0;
		this.cmdHistory = createCmdHistory();
		this.lastTime = null;
		const logger = this.logger = new CaptionsLogger();
		this.channels = [
			null,
			new Cta608Channel(field, out1, logger),
			new Cta608Channel(field + 1, out2, logger)
		];
	}
	/**
	* Add data for time t in forms of list of bytes (unsigned ints). The bytes are treated as pairs.
	*
	* @param time - The time in milliseconds
	* @param byteList - The list of bytes
	*/
	addData(time, byteList) {
		this.lastTime = time;
		this.logger.time = time;
		for (let i = 0; i < byteList.length; i += 2) {
			const a = byteList[i] & 127;
			const b = byteList[i + 1] & 127;
			let cmdFound = false;
			let charsFound = null;
			if (this.lastTime !== null) {
				time = this.lastTime + .5 * i * 1001 / 3e4;
				this.logger.time = time;
			}
			if (a === 0 && b === 0) continue;
			else this.logger.log(VerboseLevel.DATA, () => "[" + numArrayToHexArray([byteList[i], byteList[i + 1]]) + "] -> (" + numArrayToHexArray([a, b]) + ")");
			const cmdHistory = this.cmdHistory;
			if (a >= 16 && a <= 31) {
				if (hasCmdRepeated(a, b, cmdHistory)) {
					setLastCmd(null, null, cmdHistory);
					this.logger.log(VerboseLevel.DEBUG, () => "Repeated command (" + numArrayToHexArray([a, b]) + ") is dropped");
					continue;
				}
				setLastCmd(a, b, this.cmdHistory);
				cmdFound = this.parseCmd(a, b);
				if (!cmdFound) cmdFound = this.parseMidrow(a, b);
				if (!cmdFound) cmdFound = this.parsePAC(a, b);
				if (!cmdFound) cmdFound = this.parseBackgroundAttributes(a, b);
			} else setLastCmd(null, null, cmdHistory);
			if (!cmdFound) {
				charsFound = this.parseChars(a, b);
				if (charsFound.length) {
					const currChNr = this.currentChannel;
					if (currChNr && currChNr > 0) this.channels[currChNr].insertChars(charsFound);
					else this.logger.log(VerboseLevel.WARNING, "No channel found yet. TEXT-MODE?");
				}
			}
			if (!cmdFound && !charsFound) this.logger.log(VerboseLevel.WARNING, () => "Couldn't parse cleaned data " + numArrayToHexArray([a, b]) + " orig: " + numArrayToHexArray([byteList[i], byteList[i + 1]]));
		}
	}
	/**
	* Parse Command.
	*
	* @param a - The first byte
	* @param b - The second byte
	* @returns True if a command was found
	*/
	parseCmd(a, b) {
		if (!((a === 20 || a === 28 || a === 21 || a === 29) && b >= 32 && b <= 47 || (a === 23 || a === 31) && b >= 33 && b <= 35)) return false;
		const chNr = a === 20 || a === 21 || a === 23 ? 1 : 2;
		const channel = this.channels[chNr];
		if (a === 20 || a === 21 || a === 28 || a === 29) {
			if (b === 32) channel.ccRCL();
			else if (b === 33) channel.ccBS();
			else if (b === 34) channel.ccAOF();
			else if (b === 35) channel.ccAON();
			else if (b === 36) channel.ccDER();
			else if (b === 37) channel.ccRU(2);
			else if (b === 38) channel.ccRU(3);
			else if (b === 39) channel.ccRU(4);
			else if (b === 40) channel.ccFON();
			else if (b === 41) channel.ccRDC();
			else if (b === 42) channel.ccTR();
			else if (b === 43) channel.ccRTD();
			else if (b === 44) channel.ccEDM();
			else if (b === 45) channel.ccCR();
			else if (b === 46) channel.ccENM();
			else if (b === 47) channel.ccEOC();
		} else channel.ccTO(b - 32);
		this.currentChannel = chNr;
		return true;
	}
	/**
	* Parse midrow styling command
	*
	* @param a - The first byte
	* @param b - The second byte
	* @returns `true` if midrow styling command was found
	*/
	parseMidrow(a, b) {
		let chNr = 0;
		if ((a === 17 || a === 25) && b >= 32 && b <= 47) {
			if (a === 17) chNr = 1;
			else chNr = 2;
			if (chNr !== this.currentChannel) {
				this.logger.log(VerboseLevel.ERROR, "Mismatch channel in midrow parsing");
				return false;
			}
			const channel = this.channels[chNr];
			if (!channel) return false;
			channel.ccMIDROW(b);
			this.logger.log(VerboseLevel.DEBUG, () => "MIDROW (" + numArrayToHexArray([a, b]) + ")");
			return true;
		}
		return false;
	}
	/**
	* Parse Preable Access Codes (Table 53).
	*
	* @param a - The first byte
	* @param b - The second byte
	* @returns A Boolean that tells if PAC found
	*/
	parsePAC(a, b) {
		let row;
		if (!((a >= 17 && a <= 23 || a >= 25 && a <= 31) && b >= 64 && b <= 127 || (a === 16 || a === 24) && b >= 64 && b <= 95)) return false;
		const chNr = a <= 23 ? 1 : 2;
		if (b >= 64 && b <= 95) row = chNr === 1 ? rowsLowCh1[a] : rowsLowCh2[a];
		else row = chNr === 1 ? rowsHighCh1[a] : rowsHighCh2[a];
		const channel = this.channels[chNr];
		if (!channel) return false;
		channel.setPAC(this.interpretPAC(row, b));
		this.currentChannel = chNr;
		return true;
	}
	/**
	* Interpret the second byte of the pac, and return the information.
	*
	* @param row - The row number
	* @param byte - The second byte
	* @returns pacData with style parameters
	*/
	interpretPAC(row, byte) {
		let pacIndex;
		const pacData = {
			color: null,
			italics: false,
			indent: null,
			underline: false,
			row
		};
		if (byte > 95) pacIndex = byte - 96;
		else pacIndex = byte - 64;
		pacData.underline = (pacIndex & 1) === 1;
		if (pacIndex <= 13) pacData.color = [
			"white",
			"green",
			"blue",
			"cyan",
			"red",
			"yellow",
			"magenta",
			"white"
		][Math.floor(pacIndex / 2)];
		else if (pacIndex <= 15) {
			pacData.italics = true;
			pacData.color = "white";
		} else pacData.indent = Math.floor((pacIndex - 16) / 2) * 4;
		return pacData;
	}
	/**
	* Parse characters.
	*
	* @param a - The first byte
	* @param b - The second byte
	* @returns An array with 1 to 2 codes corresponding to chars, if found. null otherwise.
	*/
	parseChars(a, b) {
		let channelNr;
		let charCodes = [];
		let charCode1 = null;
		if (a >= 25) {
			channelNr = 2;
			charCode1 = a - 8;
		} else {
			channelNr = 1;
			charCode1 = a;
		}
		if (charCode1 >= 17 && charCode1 <= 19) {
			let oneCode;
			if (charCode1 === 17) oneCode = b + 80;
			else if (charCode1 === 18) oneCode = b + 112;
			else oneCode = b + 144;
			this.logger.log(VerboseLevel.INFO, () => "Special char '" + getCharForByte(oneCode) + "' in channel " + channelNr);
			charCodes = [oneCode];
		} else if (a >= 32 && a <= 127) charCodes = b === 0 ? [a] : [a, b];
		if (charCodes) this.logger.log(VerboseLevel.DEBUG, () => "Char codes =  " + numArrayToHexArray(charCodes).join(","));
		return charCodes;
	}
	/**
	* Parse extended background attributes as well as new foreground color black.
	*
	* @param a - The first byte
	* @param b - The second byte
	* @returns True if background attributes are found
	*/
	parseBackgroundAttributes(a, b) {
		if (!((a === 16 || a === 24) && b >= 32 && b <= 47 || (a === 23 || a === 31) && b >= 45 && b <= 47)) return false;
		let index;
		const bkgData = {};
		if (a === 16 || a === 24) {
			index = Math.floor((b - 32) / 2);
			bkgData.background = backgroundColors[index];
			if (b % 2 === 1) bkgData.background = bkgData.background + "_semi";
		} else if (b === 45) bkgData.background = "transparent";
		else {
			bkgData.foreground = "black";
			if (b === 47) bkgData.underline = true;
		}
		const chNr = a <= 23 ? 1 : 2;
		this.channels[chNr].setBkgData(bkgData);
		return true;
	}
	/**
	* Reset state of parser and its channels.
	*/
	reset() {
		for (let i = 0; i < Object.keys(this.channels).length; i++) {
			const channel = this.channels[i];
			if (channel) channel.reset();
		}
		setLastCmd(null, null, this.cmdHistory);
	}
	/**
	* Trigger the generation of a cue, and the start of a new one if displayScreens are not empty.
	*/
	cueSplitAtTime(t) {
		for (const channel of this.channels) if (channel) channel.cueSplitAtTime(t);
	}
};

//#endregion
//#region src/extractCta608Data.ts
/**
* Extract CTA-608 data from a DataView
*
* @param raw - The DataView to extract the data from
* @param cta608Range - The range of the CTA-608 data
* @returns The extracted CTA-608 data
*
* @beta
*/
function extractCta608Data(raw, cta608Range) {
	let pos = cta608Range[0];
	const fieldData = [[], []];
	pos += 8;
	const ccCount = raw.getUint8(pos) & 31;
	pos += 2;
	for (let i = 0; i < ccCount; i++) {
		const byte = raw.getUint8(pos);
		const ccValid = byte & 4;
		const ccType = byte & 3;
		pos++;
		const ccData1 = raw.getUint8(pos);
		pos++;
		const ccData2 = raw.getUint8(pos);
		pos++;
		if (ccValid && (ccData1 & 127) + (ccData2 & 127) !== 0) {
			if (ccType === 0) {
				fieldData[0].push(ccData1);
				fieldData[0].push(ccData2);
			} else if (ccType === 1) {
				fieldData[1].push(ccData1);
				fieldData[1].push(ccData2);
			}
		}
	}
	return fieldData;
}

//#endregion
//#region src/utils/seiHelpers.ts
function getSeiData(raw, startPos, endPos) {
	const data = [];
	for (let cursor = startPos; cursor < endPos; cursor++) if (cursor + 2 < endPos && raw.getUint8(cursor) === 0 && raw.getUint8(cursor + 1) === 0 && raw.getUint8(cursor + 2) === 3) {
		data.push(0);
		data.push(0);
		cursor += 2;
	} else data.push(raw.getUint8(cursor));
	return new DataView(new Uint8Array(data).buffer);
}
function isCea608Sei(payloadType, payloadSize, sei, pos) {
	if (payloadType !== 4 || payloadSize < 8) return false;
	if (sei.getUint8(pos) !== 181) return false;
	if (sei.getUint16(pos + 1) !== 49) return false;
	if (sei.getUint32(pos + 3) !== 1195456820) return false;
	if (sei.getUint8(pos + 7) !== 3) return false;
	return true;
}
function isCCType(type) {
	return type === 0 || type === 1;
}
function isNonEmptyCCData(ccData1, ccData2) {
	return (ccData1 & 127) > 0 || (ccData2 & 127) > 0;
}
function isSeiNalUnitType(unitType) {
	return unitType === 6;
}
function parseCta608DataFromSei(sei, fieldData) {
	let cursor = 0;
	while (cursor < sei.byteLength) {
		let payloadType = 0;
		let payloadSize = 0;
		let now;
		do
			payloadType += now = sei.getUint8(cursor++);
		while (now === 255);
		do
			payloadSize += now = sei.getUint8(cursor++);
		while (now === 255);
		if (isCea608Sei(payloadType, payloadSize, sei, cursor)) {
			const pos = cursor + 10;
			const ccCount = pos + (sei.getUint8(pos - 2) & 31) * 3;
			for (let i = pos; i < ccCount; i += 3) {
				const byte = sei.getUint8(i);
				if (byte & 4) {
					const ccType = byte & 3;
					if (isCCType(ccType)) {
						const ccData1 = sei.getUint8(i + 1);
						const ccData2 = sei.getUint8(i + 2);
						if (isNonEmptyCCData(ccData1, ccData2)) fieldData[ccType].push(ccData1, ccData2);
					}
				}
			}
		}
		cursor += payloadSize;
	}
}

//#endregion
//#region src/extractCta608DataFromSample.ts
/**
* Extracts CEA-608 data from a given sample.
*
* @param raw - The DataView with media data
* @param startPos - The start position within the DataView
* @param sampleSize - The size of the sample in bytes
* @returns fieldData array containing field 1 and field 2 data arrays
*
* @beta
*/
function extractCta608DataFromSample(raw, startPos, sampleSize) {
	let nalSize = 0;
	let nalType = 0;
	const fieldData = [[], []];
	for (let cursor = startPos; cursor < startPos + sampleSize - 5; cursor++) {
		nalSize = raw.getUint32(cursor);
		nalType = raw.getUint8(cursor + 4) & 31;
		if (cursor + 5 + nalSize > startPos + sampleSize) break;
		if (isSeiNalUnitType(nalType)) {
			if (cursor + 5 + nalSize <= raw.byteLength) parseCta608DataFromSei(getSeiData(raw, cursor + 5, cursor + 5 + nalSize), fieldData);
		}
		cursor += nalSize + 3;
	}
	return fieldData;
}

//#endregion
//#region src/findCta608Nalus.ts
/**
* Find CTA-608 NAL units in a video stream
*
* @param raw - The DataView to extract the data from
* @param startPos - The start position of the data
* @param size - The size of the data
* @returns The extracted CTA-608 NAL units
*
* @beta
*/
function findCta608Nalus(raw, startPos, size) {
	let nalSize = 0, cursor = startPos, nalType = 0;
	const cta608NaluRanges = [];
	const isCTA608SEI = (payloadType, payloadSize, raw$1, pos) => {
		if (payloadType !== 4 || payloadSize < 8) return null;
		const countryCode = raw$1.getUint8(pos);
		const providerCode = raw$1.getUint16(pos + 1);
		const userIdentifier = raw$1.getUint32(pos + 3);
		const userDataTypeCode = raw$1.getUint8(pos + 7);
		return countryCode == 181 && providerCode == 49 && userIdentifier == 1195456820 && userDataTypeCode == 3;
	};
	while (cursor < startPos + size) {
		nalSize = raw.getUint32(cursor);
		nalType = raw.getUint8(cursor + 4) & 31;
		if (nalType === 6) {
			let pos = cursor + 5;
			let payloadType = -1;
			while (pos < cursor + 4 + nalSize - 1) {
				payloadType = 0;
				let b = 255;
				while (b === 255) {
					b = raw.getUint8(pos);
					payloadType += b;
					pos++;
				}
				let payloadSize = 0;
				b = 255;
				while (b === 255) {
					b = raw.getUint8(pos);
					payloadSize += b;
					pos++;
				}
				if (isCTA608SEI(payloadType, payloadSize, raw, pos)) cta608NaluRanges.push([pos, payloadSize]);
				pos += payloadSize;
			}
		}
		cursor += nalSize + 4;
	}
	return cta608NaluRanges;
}

//#endregion
//#region src/SccParser.ts
/**
* The copyright in this software is being made available under the BSD License,
* included below. This software may be subject to other third party and contributor
* rights, including patent rights, and no such rights are granted under this license.
*
* Copyright (c) 2015-2016, DASH Industry Forum.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification,
* are permitted provided that the following conditions are met:
*  1. Redistributions of source code must retain the above copyright notice, this
*  list of conditions and the following disclaimer.
*  * Redistributions in binary form must reproduce the above copyright notice,
*  this list of conditions and the following disclaimer in the documentation and/or
*  other materials provided with the distribution.
*  2. Neither the name of Dash Industry Forum nor the names of its
*  contributors may be used to endorse or promote products derived from this software
*  without specific prior written permission.
*
*  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
*  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
*  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
*  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
*  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
*  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
*  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
*  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
*  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
*  POSSIBILITY OF SUCH DAMAGE.
*/
/**
* SCC Parser
*
* @beta
*/
var SccParser = class {
	constructor(processor, field = 1) {
		this.hasHeader = false;
		this.nrLinesParsed = 0;
		this.processor = processor;
		this.field = field;
	}
	parse(text) {
		const lines = text.split(/\r?\n/);
		this.nrLinesParsed = 0;
		if (lines[0] === "Scenarist_SCC V1.0") {
			this.hasHeader = true;
			this.nrLinesParsed++;
		}
		for (let l = 1; l < lines.length; l += 2) {
			if (lines[l] !== "") break;
			this.nrLinesParsed++;
			const lineData = this.parseDataLine(lines[l + 1]);
			if (lineData === null) break;
			this.nrLinesParsed++;
			this.processor.addData(lineData[0], lineData[1]);
		}
	}
	parseDataLine(line) {
		if (!line) return null;
		const lineParts = line.split(/\s+/);
		const timeData = lineParts[0];
		const ceaData = [];
		for (let i = 1; i < lineParts.length; i++) {
			const fourHexChars = lineParts[i];
			const a = parseInt(fourHexChars.substring(0, 2), 16);
			const b = parseInt(fourHexChars.substring(2, 4), 16);
			ceaData.push(a, b);
		}
		return [this.timeConverter(timeData), ceaData];
	}
	timeConverter(smpteTs) {
		const parts = smpteTs.split(":");
		if (parts.length === 3) {
			const lastParts = parts[2].split(";");
			parts[2] = lastParts[0];
			const frames = parseInt(lastParts[1], 10);
			return (30 * (60 * (60 * parseInt(parts[0], 10) + parseInt(parts[1], 10)) + parseInt(parts[2], 10)) + frames) * 1001 / 3e4;
		}
		return 0;
	}
	getHeaderStatus() {
		return this.hasHeader;
	}
	getField() {
		return this.field;
	}
	getLinesParsed() {
		return this.nrLinesParsed;
	}
};

//#endregion
export { CaptionScreen, CaptionsLogger, Cta608Channel, Cta608Parser, PenState, Row, SccParser, StyledUnicodeChar, VerboseLevel, extractCta608Data, extractCta608DataFromSample, findCta608Nalus };
//# sourceMappingURL=index.js.map