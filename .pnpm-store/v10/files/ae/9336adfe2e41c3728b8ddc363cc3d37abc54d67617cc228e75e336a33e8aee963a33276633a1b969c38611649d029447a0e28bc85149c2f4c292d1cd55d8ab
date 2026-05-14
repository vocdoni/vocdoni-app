import { ValueOf } from "@svta/cml-utils";

//#region src/CaptionModes.d.ts

/**
* The different caption modes that can be used.
*
* @beta
*/
type CaptionModes = "MODE_ROLL-UP" | "MODE_POP-ON" | "MODE_PAINT-ON" | "MODE_TEXT" | null;
//#endregion
//#region src/VerboseLevel.d.ts
/**
* Logging levels for the CTA-608 parser.
*
*
* @enum
*
* @beta
*/
declare const VerboseLevel: {
  readonly ERROR: 0;
  readonly TEXT: 1;
  readonly WARNING: 2;
  readonly INFO: 2;
  readonly DEBUG: 3;
  readonly DATA: 3;
};
/**
* @beta
*/
type VerboseLevel = ValueOf<typeof VerboseLevel>;
//#endregion
//#region src/CaptionsLogger.d.ts

/**
* CaptionsLogger. To be removed in the future.
*
* @beta
*/
declare class CaptionsLogger {
  time: number | null;
  verboseLevel: VerboseLevel;
  log(severity: VerboseLevel, msg: string | (() => string)): void;
}
//#endregion
//#region src/PACData.d.ts
/**
* Represents a single PAC (Preamble Address Code) data.
*
* @beta
*/
type PACData = {
  row: number;
  indent: number | null;
  color: string | null;
  underline: boolean;
  italics: boolean;
};
//#endregion
//#region src/PenStyles.d.ts
/**
* PenStyles
*
* @beta
*/
type PenStyles = {
  foreground: string | null;
  underline: boolean;
  italics: boolean;
  background: string;
  flash: boolean;
};
//#endregion
//#region src/PenState.d.ts

/**
* Pen state.
*
* @beta
*/
declare class PenState {
  foreground: string;
  underline: boolean;
  italics: boolean;
  background: string;
  flash: boolean;
  reset(): void;
  setStyles(styles: Partial<PenStyles>): void;
  isDefault(): boolean;
  equals(other: PenState): boolean;
  copy(newPenState: PenState): void;
}
//#endregion
//#region src/StyledUnicodeChar.d.ts

/**
* Unicode character with styling and background.
*
* @beta
*/
declare class StyledUnicodeChar {
  uchar: string;
  penState: PenState;
  reset(): void;
  setChar(uchar: string, newPenState: PenState): void;
  setPenState(newPenState: PenState): void;
  equals(other: StyledUnicodeChar): boolean;
  copy(newChar: StyledUnicodeChar): void;
  isEmpty(): boolean;
}
//#endregion
//#region src/Row.d.ts
/**
* CTA-608 row consisting of NR_COLS instances of StyledUnicodeChar.
*
* @beta
*/
declare class Row {
  chars: StyledUnicodeChar[];
  cueStartTime: number | null;
  private pos;
  private currPenState;
  private logger;
  constructor(logger?: CaptionsLogger);
  equals(other: Row): boolean;
  copy(other: Row): void;
  isEmpty(): boolean;
  /**
  *  Set the cursor to a valid column.
  */
  setCursor(absPos: number): void;
  /**
  * Move the cursor relative to current position.
  */
  moveCursor(relPos: number): void;
  /**
  * Backspace, move one step back and clear character.
  */
  backSpace(): void;
  insertChar(byte: number): void;
  clearFromPos(startPos: number): void;
  clear(): void;
  clearToEndOfRow(): void;
  getTextString(): string;
  setPenStyles(styles: Partial<PenStyles>): void;
}
//#endregion
//#region src/CaptionScreen.d.ts
/**
* Keep a CTA-608 screen of 32x15 styled characters
*
* @beta
*/
declare class CaptionScreen {
  rows: Row[];
  private currRow;
  private nrRollUpRows;
  private lastOutputScreen;
  private logger;
  constructor(logger?: CaptionsLogger);
  reset(): void;
  equals(other: CaptionScreen): boolean;
  copy(other: CaptionScreen): void;
  isEmpty(): boolean;
  backSpace(): void;
  clearToEndOfRow(): void;
  /**
  * Insert a character (without styling) in the current row.
  */
  insertChar(char: number): void;
  setPen(styles: Partial<PenStyles>): void;
  moveCursor(relPos: number): void;
  setCursor(absPos: number): void;
  setPAC(pacData: PACData): void;
  /**
  * Set background/extra foreground, but first do back_space, and then insert space (backwards compatibility).
  */
  setBkgData(bkgData: Partial<PenStyles>): void;
  setRollUpRows(nrRows: number | null): void;
  rollUp(): void;
  /**
  * Get all non-empty rows with as unicode text.
  */
  getDisplayText(asOneRow?: boolean): string;
  getTextAndFormat(): Row[];
}
//#endregion
//#region src/CueHandler.d.ts
/**
* A handler for CTA-608 cues.
*
* @beta
*/
type CueHandler = {
  newCue(startTime: number, endTime: number, screen: CaptionScreen): void;
  reset?(): void;
  dispatchCue?(): void;
};
//#endregion
//#region src/Cta608Channel.d.ts
/**
* CTA-608 Channel
*
* @beta
*/
declare class Cta608Channel {
  chNr: number;
  outputFilter: CueHandler;
  mode: CaptionModes;
  displayedMemory: CaptionScreen;
  nonDisplayedMemory: CaptionScreen;
  lastOutputScreen: CaptionScreen;
  currRollUpRow: Row;
  writeScreen: CaptionScreen;
  cueStartTime: number | null;
  private logger;
  constructor(channelNumber: number, outputFilter: CueHandler, logger?: CaptionsLogger);
  reset(): void;
  getHandler(): CueHandler;
  setHandler(outputFilter: CueHandler): void;
  setPAC(pacData: PACData): void;
  setBkgData(bkgData: Partial<PenStyles>): void;
  setMode(newMode: CaptionModes): void;
  insertChars(chars: number[]): void;
  ccRCL(): void;
  ccBS(): void;
  ccAOF(): void;
  ccAON(): void;
  ccDER(): void;
  ccRU(nrRows: number | null): void;
  ccFON(): void;
  ccRDC(): void;
  ccTR(): void;
  ccRTD(): void;
  ccEDM(): void;
  ccCR(): void;
  ccENM(): void;
  ccEOC(): void;
  ccTO(nrCols: number): void;
  ccMIDROW(secondByte: number): void;
  outputDataUpdate(dispatch?: boolean): void;
  cueSplitAtTime(t: number): void;
}
//#endregion
//#region src/SupportedField.d.ts
/**
* SupportedField
*
* @beta
*/
type SupportedField = 1 | 3;
//#endregion
//#region src/Cta608Parser.d.ts
/**
* CEA-608 caption parser.
*
* @beta
*/
declare class Cta608Parser {
  private channels;
  private currentChannel;
  private cmdHistory;
  private logger;
  private lastTime;
  constructor(field: SupportedField, out1: any, out2: any);
  /**
  * Add data for time t in forms of list of bytes (unsigned ints). The bytes are treated as pairs.
  *
  * @param time - The time in milliseconds
  * @param byteList - The list of bytes
  */
  addData(time: number | null, byteList: number[]): void;
  /**
  * Parse Command.
  *
  * @param a - The first byte
  * @param b - The second byte
  * @returns True if a command was found
  */
  private parseCmd;
  /**
  * Parse midrow styling command
  *
  * @param a - The first byte
  * @param b - The second byte
  * @returns `true` if midrow styling command was found
  */
  private parseMidrow;
  /**
  * Parse Preable Access Codes (Table 53).
  *
  * @param a - The first byte
  * @param b - The second byte
  * @returns A Boolean that tells if PAC found
  */
  private parsePAC;
  /**
  * Interpret the second byte of the pac, and return the information.
  *
  * @param row - The row number
  * @param byte - The second byte
  * @returns pacData with style parameters
  */
  private interpretPAC;
  /**
  * Parse characters.
  *
  * @param a - The first byte
  * @param b - The second byte
  * @returns An array with 1 to 2 codes corresponding to chars, if found. null otherwise.
  */
  private parseChars;
  /**
  * Parse extended background attributes as well as new foreground color black.
  *
  * @param a - The first byte
  * @param b - The second byte
  * @returns True if background attributes are found
  */
  private parseBackgroundAttributes;
  /**
  * Reset state of parser and its channels.
  */
  reset(): void;
  /**
  * Trigger the generation of a cue, and the start of a new one if displayScreens are not empty.
  */
  cueSplitAtTime(t: number): void;
}
//#endregion
//#region src/extractCta608Data.d.ts
/**
* Extract CTA-608 data from a DataView
*
* @param raw - The DataView to extract the data from
* @param cta608Range - The range of the CTA-608 data
* @returns The extracted CTA-608 data
*
* @beta
*/
declare function extractCta608Data(raw: DataView, cta608Range: number[]): number[][];
//#endregion
//#region src/extractCta608DataFromSample.d.ts
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
declare function extractCta608DataFromSample(raw: DataView, startPos: number, sampleSize: number): number[][];
//#endregion
//#region src/findCta608Nalus.d.ts
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
declare function findCta608Nalus(raw: DataView, startPos: number, size: number): number[][];
//#endregion
//#region src/SccParser.d.ts
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
declare class SccParser {
  hasHeader: boolean;
  nrLinesParsed: number;
  processor: any;
  field: number | any;
  constructor(processor: any, field?: number | any);
  parse(text: string): void;
  parseDataLine(line: string): [number, number[]] | null;
  timeConverter(smpteTs: string): number;
  getHeaderStatus(): boolean;
  getField(): number | any;
  getLinesParsed(): number;
}
//#endregion
export { CaptionModes, CaptionScreen, CaptionsLogger, Cta608Channel, Cta608Parser, CueHandler, PACData, PenState, PenStyles, Row, SccParser, StyledUnicodeChar, SupportedField, VerboseLevel, extractCta608Data, extractCta608DataFromSample, findCta608Nalus };
//# sourceMappingURL=index.d.ts.map