'use strict';

Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });

const process = require('node:process');
const node_child_process = require('node:child_process');
const fs = require('node:fs');
const tty = require('node:tty');

const _interopDefaultCompat = e => e && typeof e === 'object' && 'default' in e ? e.default : e;

const process__default = /*#__PURE__*/_interopDefaultCompat(process);
const fs__default = /*#__PURE__*/_interopDefaultCompat(fs);
const tty__default = /*#__PURE__*/_interopDefaultCompat(tty);

const r = String.raw;
const e = r`\p{Emoji}(?:\p{EMod}|[\u{E0020}-\u{E007E}]+\u{E007F}|\uFE0F?\u20E3?)`;
const emojiRegex = () => new RegExp(r`\p{RI}{2}|(?![#*\d](?!\uFE0F?\u20E3))${e}(?:\u200D${e})*`, "gu");
const ESCAPES = /* @__PURE__ */ new Set(["\x1B", ""]);
const ANSI_ESCAPE_BELL = "\x07";
const ANSI_CSI = "[";
const ANSI_SGR_TERMINATOR = "m";
const ANSI_ESCAPE_LINK = `]8;;`;
const END_CODE = 39;
const RE_ZERO_WIDTH = /[\u200B\uFEFF\u2060-\u2064]/g;
const RE_ESCAPE_PATTERN = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`);
const ANSI_RESET_CODES = Object.freeze(
  /* @__PURE__ */ new Map([
    [0, 0],
    // Reset all
    [1, 22],
    // Bold → Not bold
    [2, 22],
    // Dim → Not bold
    [3, 23],
    // Italic → Not italic
    [4, 24],
    // Underline → Not underline
    [7, 27],
    // Inverse → Not inverse
    [8, 28],
    // Hidden → Not hidden
    [9, 29],
    // Strikethrough → Not strikethrough
    [30, 39],
    // Foreground colors → Default foreground
    [31, 39],
    [32, 39],
    [33, 39],
    [34, 39],
    [35, 39],
    [36, 39],
    [37, 39],
    [40, 49],
    // Background colors → Default background
    [41, 49],
    [42, 49],
    [43, 49],
    [44, 49],
    [45, 49],
    [46, 49],
    [47, 49],
    [90, 39]
    // Bright foreground → Default foreground
  ])
);
const RE_ANSI = /[\u001B\u009B](?:[[()#;?]{0,10}(?:\d{1,4}(?:;\d{0,4})*)?[0-9A-ORZcf-nqry=><]|\]8;;[^\u0007\u001B]{0,100}(?:\u0007|\u001B\\))/g;
const RE_CONTROL = /[\u0000-\u0008\n-\u001F\u007F-\u009F]{1,1000}/y;
const RE_EMOJI = emojiRegex();

function isAmbiguous(x) {
  return x === 161 || x === 164 || x === 167 || x === 168 || x === 170 || x === 173 || x === 174 || x >= 176 && x <= 180 || x >= 182 && x <= 186 || x >= 188 && x <= 191 || x === 198 || x === 208 || x === 215 || x === 216 || x >= 222 && x <= 225 || x === 230 || x >= 232 && x <= 234 || x === 236 || x === 237 || x === 240 || x === 242 || x === 243 || x >= 247 && x <= 250 || x === 252 || x === 254 || x === 257 || x === 273 || x === 275 || x === 283 || x === 294 || x === 295 || x === 299 || x >= 305 && x <= 307 || x === 312 || x >= 319 && x <= 322 || x === 324 || x >= 328 && x <= 331 || x === 333 || x === 338 || x === 339 || x === 358 || x === 359 || x === 363 || x === 462 || x === 464 || x === 466 || x === 468 || x === 470 || x === 472 || x === 474 || x === 476 || x === 593 || x === 609 || x === 708 || x === 711 || x >= 713 && x <= 715 || x === 717 || x === 720 || x >= 728 && x <= 731 || x === 733 || x === 735 || x >= 768 && x <= 879 || x >= 913 && x <= 929 || x >= 931 && x <= 937 || x >= 945 && x <= 961 || x >= 963 && x <= 969 || x === 1025 || x >= 1040 && x <= 1103 || x === 1105 || x === 8208 || x >= 8211 && x <= 8214 || x === 8216 || x === 8217 || x === 8220 || x === 8221 || x >= 8224 && x <= 8226 || x >= 8228 && x <= 8231 || x === 8240 || x === 8242 || x === 8243 || x === 8245 || x === 8251 || x === 8254 || x === 8308 || x === 8319 || x >= 8321 && x <= 8324 || x === 8364 || x === 8451 || x === 8453 || x === 8457 || x === 8467 || x === 8470 || x === 8481 || x === 8482 || x === 8486 || x === 8491 || x === 8531 || x === 8532 || x >= 8539 && x <= 8542 || x >= 8544 && x <= 8555 || x >= 8560 && x <= 8569 || x === 8585 || x >= 8592 && x <= 8601 || x === 8632 || x === 8633 || x === 8658 || x === 8660 || x === 8679 || x === 8704 || x === 8706 || x === 8707 || x === 8711 || x === 8712 || x === 8715 || x === 8719 || x === 8721 || x === 8725 || x === 8730 || x >= 8733 && x <= 8736 || x === 8739 || x === 8741 || x >= 8743 && x <= 8748 || x === 8750 || x >= 8756 && x <= 8759 || x === 8764 || x === 8765 || x === 8776 || x === 8780 || x === 8786 || x === 8800 || x === 8801 || x >= 8804 && x <= 8807 || x === 8810 || x === 8811 || x === 8814 || x === 8815 || x === 8834 || x === 8835 || x === 8838 || x === 8839 || x === 8853 || x === 8857 || x === 8869 || x === 8895 || x === 8978 || x >= 9312 && x <= 9449 || x >= 9451 && x <= 9547 || x >= 9552 && x <= 9587 || x >= 9600 && x <= 9615 || x >= 9618 && x <= 9621 || x === 9632 || x === 9633 || x >= 9635 && x <= 9641 || x === 9650 || x === 9651 || x === 9654 || x === 9655 || x === 9660 || x === 9661 || x === 9664 || x === 9665 || x >= 9670 && x <= 9672 || x === 9675 || x >= 9678 && x <= 9681 || x >= 9698 && x <= 9701 || x === 9711 || x === 9733 || x === 9734 || x === 9737 || x === 9742 || x === 9743 || x === 9756 || x === 9758 || x === 9792 || x === 9794 || x === 9824 || x === 9825 || x >= 9827 && x <= 9829 || x >= 9831 && x <= 9834 || x === 9836 || x === 9837 || x === 9839 || x === 9886 || x === 9887 || x === 9919 || x >= 9926 && x <= 9933 || x >= 9935 && x <= 9939 || x >= 9941 && x <= 9953 || x === 9955 || x === 9960 || x === 9961 || x >= 9963 && x <= 9969 || x === 9972 || x >= 9974 && x <= 9977 || x === 9979 || x === 9980 || x === 9982 || x === 9983 || x === 10045 || x >= 10102 && x <= 10111 || x >= 11094 && x <= 11097 || x >= 12872 && x <= 12879 || x >= 57344 && x <= 63743 || x >= 65024 && x <= 65039 || x === 65533 || x >= 127232 && x <= 127242 || x >= 127248 && x <= 127277 || x >= 127280 && x <= 127337 || x >= 127344 && x <= 127373 || x === 127375 || x === 127376 || x >= 127387 && x <= 127404 || x >= 917760 && x <= 917999 || x >= 983040 && x <= 1048573 || x >= 1048576 && x <= 1114109;
}
function isFullWidth(x) {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
}
function isWide(x) {
  return x >= 4352 && x <= 4447 || x === 8986 || x === 8987 || x === 9001 || x === 9002 || x >= 9193 && x <= 9196 || x === 9200 || x === 9203 || x === 9725 || x === 9726 || x === 9748 || x === 9749 || x >= 9776 && x <= 9783 || x >= 9800 && x <= 9811 || x === 9855 || x >= 9866 && x <= 9871 || x === 9875 || x === 9889 || x === 9898 || x === 9899 || x === 9917 || x === 9918 || x === 9924 || x === 9925 || x === 9934 || x === 9940 || x === 9962 || x === 9970 || x === 9971 || x === 9973 || x === 9978 || x === 9981 || x === 9989 || x === 9994 || x === 9995 || x === 10024 || x === 10060 || x === 10062 || x >= 10067 && x <= 10069 || x === 10071 || x >= 10133 && x <= 10135 || x === 10160 || x === 10175 || x === 11035 || x === 11036 || x === 11088 || x === 11093 || x >= 11904 && x <= 11929 || x >= 11931 && x <= 12019 || x >= 12032 && x <= 12245 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12353 && x <= 12438 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12773 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 42124 || x >= 42128 && x <= 42182 || x >= 43360 && x <= 43388 || x >= 44032 && x <= 55203 || x >= 63744 && x <= 64255 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 94176 && x <= 94180 || x >= 94192 && x <= 94198 || x >= 94208 && x <= 101589 || x >= 101631 && x <= 101662 || x >= 101760 && x <= 101874 || x >= 110576 && x <= 110579 || x >= 110581 && x <= 110587 || x === 110589 || x === 110590 || x >= 110592 && x <= 110882 || x === 110898 || x >= 110928 && x <= 110930 || x === 110933 || x >= 110948 && x <= 110951 || x >= 110960 && x <= 111355 || x >= 119552 && x <= 119638 || x >= 119648 && x <= 119670 || x === 126980 || x === 127183 || x === 127374 || x >= 127377 && x <= 127386 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x === 127568 || x === 127569 || x >= 127584 && x <= 127589 || x >= 127744 && x <= 127776 || x >= 127789 && x <= 127797 || x >= 127799 && x <= 127868 || x >= 127870 && x <= 127891 || x >= 127904 && x <= 127946 || x >= 127951 && x <= 127955 || x >= 127968 && x <= 127984 || x === 127988 || x >= 127992 && x <= 128062 || x === 128064 || x >= 128066 && x <= 128252 || x >= 128255 && x <= 128317 || x >= 128331 && x <= 128334 || x >= 128336 && x <= 128359 || x === 128378 || x === 128405 || x === 128406 || x === 128420 || x >= 128507 && x <= 128591 || x >= 128640 && x <= 128709 || x === 128716 || x >= 128720 && x <= 128722 || x >= 128725 && x <= 128728 || x >= 128732 && x <= 128735 || x === 128747 || x === 128748 || x >= 128756 && x <= 128764 || x >= 128992 && x <= 129003 || x === 129008 || x >= 129292 && x <= 129338 || x >= 129340 && x <= 129349 || x >= 129351 && x <= 129535 || x >= 129648 && x <= 129660 || x >= 129664 && x <= 129674 || x >= 129678 && x <= 129734 || x === 129736 || x >= 129741 && x <= 129756 || x >= 129759 && x <= 129770 || x >= 129775 && x <= 129784 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
}
function getCategory(x) {
  if (isAmbiguous(x)) return "ambiguous";
  if (isFullWidth(x)) return "fullwidth";
  if (x === 8361 || x >= 65377 && x <= 65470 || x >= 65474 && x <= 65479 || x >= 65482 && x <= 65487 || x >= 65490 && x <= 65495 || x >= 65498 && x <= 65500 || x >= 65512 && x <= 65518) {
    return "halfwidth";
  }
  if (x >= 32 && x <= 126 || x === 162 || x === 163 || x === 165 || x === 166 || x === 172 || x === 175 || x >= 10214 && x <= 10221 || x === 10629 || x === 10630) {
    return "narrow";
  }
  if (isWide(x)) return "wide";
  return "neutral";
}
function validate(codePoint) {
  if (!Number.isSafeInteger(codePoint)) {
    throw new TypeError(`Expected a code point, got \`${typeof codePoint}\`.`);
  }
}
function eastAsianWidthType(codePoint) {
  validate(codePoint);
  return getCategory(codePoint);
}
const charWidthCache = /* @__PURE__ */ new Map();
const RE_LATIN_CHARS = /(?:[\u0020-\u007E\u00A0-\u00FF](?!\uFE0F)){1,1000}/y;
const getCharType = (codePoint) => {
  if (codePoint >= 32 && codePoint <= 126) {
    return "latin";
  }
  if (codePoint === 8203 || codePoint === 8204 || codePoint === 8205 || codePoint === 8288) {
    return "zero";
  }
  if (codePoint <= 31 || codePoint >= 127 && codePoint <= 159) {
    return "control";
  }
  if (codePoint >= 160 && codePoint <= 255) {
    return "latin";
  }
  if (codePoint >= 9472 && codePoint <= 9599) {
    return "latin";
  }
  if (codePoint >= 4352 && codePoint <= 4607 || codePoint >= 11904 && codePoint <= 40959 || codePoint >= 44032 && codePoint <= 55215 || codePoint >= 63744 && codePoint <= 64255 || codePoint >= 65280 && codePoint <= 65519 && !(codePoint >= 65377 && codePoint <= 65439) || codePoint >= 12352 && codePoint <= 12543) {
    return "wide";
  }
  if (codePoint === 8230) {
    return "latin";
  }
  return "other";
};
const getCachedCharWidth = (codePoint, config) => {
  const highBits = Math.floor(codePoint / 65536);
  const lowBits = codePoint % 65536;
  let lowMap = charWidthCache.get(highBits);
  if (!lowMap) {
    lowMap = /* @__PURE__ */ new Map();
    charWidthCache.set(highBits, lowMap);
  }
  if (lowMap.has(lowBits)) {
    return lowMap.get(lowBits);
  }
  let width;
  if (getCharType(codePoint) === "latin") {
    width = config.width.regular;
  } else if (getCharType(codePoint) === "control") {
    width = config.width.control;
  } else if (getCharType(codePoint) === "wide") {
    width = config.width.wide;
  } else {
    const eaw = eastAsianWidthType(codePoint);
    switch (eaw) {
      case "ambiguous": {
        width = config.width.ambiguousIsNarrow ? config.width.regular : config.width.wide;
        break;
      }
      case "fullwidth": {
        width = config.width.fullWidth;
        break;
      }
      case "wide": {
        width = config.width.wide;
        break;
      }
      default: {
        width = config.width.regular;
      }
    }
  }
  lowMap.set(lowBits, width);
  return width;
};
const isCombiningCharacter = (codePoint) => {
  if (codePoint >= 768 && codePoint <= 879 || codePoint >= 6832 && codePoint <= 6911 || codePoint >= 7616 && codePoint <= 7679 || codePoint >= 8400 && codePoint <= 8447 || codePoint >= 65056 && codePoint <= 65071) {
    return true;
  }
  if (codePoint >= 917760 && codePoint <= 917999 || codePoint >= 65024 && codePoint <= 65039) {
    return true;
  }
  if (codePoint >= 3633 && codePoint <= 3642 || codePoint >= 3655 && codePoint <= 3662 || codePoint >= 3761 && codePoint <= 3769 || codePoint >= 3771 && codePoint <= 3772 || codePoint >= 3784 && codePoint <= 3789) {
    return true;
  }
  if (codePoint >= 2304 && codePoint <= 2307 || codePoint >= 2362 && codePoint <= 2383 || codePoint >= 2385 && codePoint <= 2391 || codePoint >= 2402 && codePoint <= 2403 || codePoint >= 2433 && codePoint <= 2435 || codePoint >= 2492 && codePoint <= 2500 || codePoint >= 2509 && codePoint <= 2509 || codePoint >= 2561 && codePoint <= 2563 || codePoint >= 2620 && codePoint <= 2637) {
    return true;
  }
  if (codePoint >= 1611 && codePoint <= 1631 || codePoint >= 1648 && codePoint <= 1648 || codePoint >= 1750 && codePoint <= 1773 || codePoint >= 2276 && codePoint <= 2302) {
    return true;
  }
  if (codePoint >= 1425 && codePoint <= 1469 || codePoint >= 1471 && codePoint <= 1471 || codePoint >= 1473 && codePoint <= 1474 || codePoint >= 1476 && codePoint <= 1477 || codePoint >= 1479 && codePoint <= 1479) {
    return true;
  }
  if (codePoint >= 3893 && codePoint <= 3893 || codePoint >= 3895 && codePoint <= 3895 || codePoint >= 3897 && codePoint <= 3897 || codePoint >= 3953 && codePoint <= 3966 || codePoint >= 3968 && codePoint <= 3972 || codePoint >= 3974 && codePoint <= 3975) {
    return true;
  }
  return codePoint >= 768 && codePoint <= 777 || codePoint >= 803 && codePoint <= 803;
};
const getStringTruncatedWidth = (input, options = {}) => {
  if (!input || input.length === 0) {
    return { ellipsed: false, index: 0, truncated: false, width: 0 };
  }
  const config = {
    truncation: {
      countAnsiEscapeCodes: options.countAnsiEscapeCodes ?? false,
      ellipsis: options.ellipsis ?? "",
      ellipsisWidth: options.ellipsisWidth ?? (options.ellipsis ? getStringTruncatedWidth(options.ellipsis, {
        ...options,
        ellipsis: "",
        ellipsisWidth: 0,
        limit: Number.POSITIVE_INFINITY
      }).width : 0),
      limit: options.limit ?? Number.POSITIVE_INFINITY
    },
    width: {
      ambiguousIsNarrow: options.ambiguousIsNarrow ?? false,
      ansi: options.ansiWidth ?? 0,
      control: options.controlWidth ?? 0,
      emoji: options.emojiWidth ?? 2,
      fullWidth: options.fullWidth ?? 2,
      halfWidth: options.halfWidth ?? 1,
      regular: options.regularWidth ?? 1,
      tab: options.tabWidth ?? 8,
      wide: options.wideWidth ?? 2
    }
  };
  const truncationLimit = Math.max(0, config.truncation.limit - config.truncation.ellipsisWidth);
  const { length } = input;
  const useCaching = length > 1e4;
  let index = 0;
  let width = 0;
  let truncationIndex = length;
  let truncationEnabled = false;
  const hasAnsi = input.includes("\x1B") || input.includes("");
  while (index < length) {
    if (hasAnsi && (input[index] === "\x1B" || input[index] === "")) {
      if (input.startsWith("\x1B]8;;", index)) {
        const BELL = "\x07";
        const OSC8_CLOSER = `\x1B]8;;${BELL}`;
        const OSC8_CLOSER_LEN = OSC8_CLOSER.length;
        const endOfParametersIndex = input.indexOf(BELL, index + 5);
        if (endOfParametersIndex === -1) ;
        else {
          const startOfCloserIndex = input.indexOf(OSC8_CLOSER, endOfParametersIndex + 1);
          if (startOfCloserIndex === -1) ;
          else {
            const endOfSequenceIndex = startOfCloserIndex + OSC8_CLOSER_LEN;
            const linkText = input.slice(endOfParametersIndex + 1, startOfCloserIndex);
            const strippedLinkText = linkText.replace(RE_ANSI, "");
            const linkTextWidthResult = getStringTruncatedWidth(strippedLinkText, {
              ambiguousIsNarrow: config.width.ambiguousIsNarrow,
              ansiWidth: config.width.ansi,
              controlWidth: config.width.control,
              countAnsiEscapeCodes: false,
              // Never count ANSI in link text width
              ellipsis: config.truncation.ellipsis,
              ellipsisWidth: config.truncation.ellipsisWidth,
              emojiWidth: config.width.emoji,
              fullWidth: config.width.fullWidth,
              halfWidth: config.width.halfWidth,
              limit: Math.max(0, truncationLimit - width),
              regularWidth: config.width.regular,
              tabWidth: config.width.tab,
              wideWidth: config.width.wide
            });
            const textWidth = linkTextWidthResult.width;
            if (linkTextWidthResult.truncated) {
              truncationEnabled = true;
              truncationIndex = Math.min(truncationIndex, index);
            } else if (width + textWidth > truncationLimit) {
              truncationIndex = Math.min(truncationIndex, index);
              truncationEnabled = true;
              if (width + textWidth > config.truncation.limit) {
                break;
              }
            }
            width += textWidth;
            index = endOfSequenceIndex;
            if (truncationEnabled && width >= config.truncation.limit) {
              break;
            }
            continue;
          }
        }
      }
      RE_ANSI.lastIndex = index;
      if (RE_ANSI.test(input)) {
        const ansiLength = RE_ANSI.lastIndex - index;
        const ansiWidth = config.truncation.countAnsiEscapeCodes ? ansiLength : config.width.ansi;
        if (width + ansiWidth > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, index);
          if (width + ansiWidth > config.truncation.limit) {
            truncationEnabled = true;
            break;
          }
        }
        width += ansiWidth;
        index = RE_ANSI.lastIndex;
        continue;
      }
    }
    const charCode = input.codePointAt(index);
    if (charCode === 8203 || charCode === 65279 || charCode >= 8288 && charCode <= 8292) {
      index += 1;
      continue;
    }
    if (charCode === 9) {
      if (width + config.width.tab > truncationLimit) {
        truncationIndex = Math.min(truncationIndex, index);
        if (width + config.width.tab > config.truncation.limit) {
          truncationEnabled = true;
          break;
        }
      }
      width += config.width.tab;
      index += 1;
      continue;
    }
    RE_LATIN_CHARS.lastIndex = index;
    if (RE_LATIN_CHARS.test(input)) {
      const latinLength = RE_LATIN_CHARS.lastIndex - index;
      const latinWidth = latinLength * config.width.regular;
      if (width + latinWidth > truncationLimit) {
        const charsToLimit = Math.floor((truncationLimit - width) / config.width.regular);
        truncationIndex = Math.min(truncationIndex, index + charsToLimit);
        if (width + latinWidth > config.truncation.limit) {
          truncationEnabled = true;
          break;
        }
      }
      width += latinWidth;
      index = RE_LATIN_CHARS.lastIndex;
      continue;
    }
    if (charCode <= 31 || charCode >= 127 && charCode <= 159) {
      RE_CONTROL.lastIndex = index;
      if (RE_CONTROL.test(input)) {
        const controlLength = RE_CONTROL.lastIndex - index;
        const controlWidth = controlLength * config.width.control;
        if (width + controlWidth > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / config.width.control));
          if (width + controlWidth > config.truncation.limit) {
            truncationEnabled = true;
            break;
          }
        }
        width += controlWidth;
        index = RE_CONTROL.lastIndex;
        continue;
      }
    }
    RE_EMOJI.lastIndex = index;
    if (RE_EMOJI.test(input)) {
      if (width + config.width.emoji > truncationLimit) {
        truncationIndex = Math.min(truncationIndex, index);
        if (width + config.width.emoji > config.truncation.limit) {
          truncationEnabled = true;
          break;
        }
      }
      width += config.width.emoji;
      index = RE_EMOJI.lastIndex;
      continue;
    }
    const codePoint = input.codePointAt(index) ?? 0;
    if (isCombiningCharacter(codePoint)) {
      index += codePoint > 65535 ? 2 : 1;
      continue;
    }
    let charWidth;
    if (useCaching) {
      charWidth = getCachedCharWidth(codePoint, config);
    } else {
      const charType = getCharType(codePoint);
      switch (charType) {
        case "control": {
          charWidth = config.width.control;
          break;
        }
        case "latin": {
          charWidth = config.width.regular;
          break;
        }
        case "wide": {
          charWidth = config.width.wide;
          break;
        }
        case "zero": {
          charWidth = 0;
          break;
        }
        default: {
          const eaw = eastAsianWidthType(codePoint);
          switch (eaw) {
            case "ambiguous": {
              charWidth = config.width.ambiguousIsNarrow ? config.width.regular : config.width.wide;
              break;
            }
            case "fullwidth": {
              charWidth = config.width.fullWidth;
              break;
            }
            case "wide": {
              charWidth = config.width.wide;
              break;
            }
            default: {
              charWidth = config.width.regular;
            }
          }
        }
      }
    }
    if (width + charWidth > truncationLimit) {
      truncationIndex = Math.min(truncationIndex, index);
      if (width + charWidth > config.truncation.limit) {
        truncationEnabled = true;
        break;
      }
    }
    width += charWidth;
    index += codePoint > 65535 ? 2 : 1;
  }
  let finalWidth = width;
  let ellipsed = false;
  if (truncationEnabled && config.truncation.limit >= config.truncation.ellipsisWidth) {
    finalWidth = config.truncation.limit;
    ellipsed = true;
  }
  return {
    ellipsed,
    index: truncationEnabled ? truncationIndex : length,
    truncated: truncationEnabled,
    width: finalWidth
  };
};

const getStringWidth = (input, options = {}) => getStringTruncatedWidth(input, { ...options, ellipsis: "", ellipsisWidth: 0, limit: Number.POSITIVE_INFINITY }).width;

const halfDiff = (maxWidth, currentWidth) => Math.floor((maxWidth - currentWidth) / 2);
const fullDiff = (maxWidth, currentWidth) => maxWidth - currentWidth;
const alignText = (text, options = {}) => {
  const align = options.align ?? "center";
  if (align === "left") {
    return text;
  }
  const split = options.split ?? "\n";
  const pad = options.pad ?? " ";
  const widthDiffFunction = align === "right" ? fullDiff : halfDiff;
  let returnString = false;
  if (!Array.isArray(text)) {
    returnString = true;
    text = String(text).split(split);
  }
  let width;
  let maxWidth = 0;
  text = text.map((input) => {
    input = String(input);
    width = getStringWidth(input, options.stringWidthOptions);
    maxWidth = Math.max(width, maxWidth);
    return {
      str: input,
      width
    };
  }).map((object) => Array.from({ length: widthDiffFunction(maxWidth, object.width) + 1 }).join(pad) + object.str);
  return returnString ? text.join(split) : text;
};

class AnsiStateTracker {
  activeForeground = null;
  activeBackground = null;
  // Track other formatting (bold, italic, etc.)
  activeFormatting = [];
  /**
   * Processes an escape sequence and updates the internal state
   * @param sequence The escape sequence to process
   */
  processEscape(sequence) {
    const match = /\x1B\[(\d+)m/.exec(sequence);
    if (!match) {
      return;
    }
    const code = Number.parseInt(match[1], 10);
    switch (code) {
      case 0: {
        this.activeForeground = null;
        this.activeBackground = null;
        this.activeFormatting = [];
        break;
      }
      case 39: {
        this.activeForeground = null;
        break;
      }
      case 49: {
        this.activeBackground = null;
        break;
      }
      default: {
        if (code >= 30 && code <= 37 || code >= 90 && code <= 97) {
          this.activeForeground = sequence;
        } else if (code >= 40 && code <= 47 || code >= 100 && code <= 107) {
          this.activeBackground = sequence;
        } else if ([1, 2, 3, 4, 7, 8, 9].includes(code)) {
          this.activeFormatting.push(sequence);
        } else if ([22, 23, 24, 27, 28, 29].includes(code)) {
          const formatResetMap = {
            22: "[1m",
            // Reset bold
            23: "[3m",
            // Reset italic
            24: "[4m",
            // Reset underline
            27: "[7m",
            // Reset inverse
            28: "[8m",
            // Reset hidden
            29: "[9m"
            // Reset strikethrough
          };
          const formatToRemove = formatResetMap[code];
          if (formatToRemove) {
            this.activeFormatting = this.activeFormatting.filter((fmt) => !fmt.includes(formatToRemove));
          }
        }
      }
    }
  }
  /**
   * Gets all active escape sequences to apply
   * @returns String with all active escapes
   */
  getStartEscapesForAllActiveAttributes() {
    return [this.activeBackground, this.activeForeground, ...this.activeFormatting].filter(Boolean).join("");
  }
  /**
   * Gets all closing escape sequences for the currently active attributes.
   * The order is generally reverse of application: formatting, foreground, background.
   * @returns String with all necessary closing escapes.
   */
  getEndEscapesForAllActiveAttributes() {
    const closingEscapes = [];
    if (this.activeFormatting.length > 0) {
      const formatResetMap = {
        "\x1B[1m": "\x1B[22m",
        // Bold
        "\x1B[2m": "\x1B[22m",
        // Faint/Dim (also reset by 22)
        "\x1B[3m": "\x1B[23m",
        // Italic
        "\x1B[4m": "\x1B[24m",
        // Underline
        "\x1B[7m": "\x1B[27m",
        // Inverse
        "\x1B[8m": "\x1B[28m",
        // Hidden/Conceal
        "\x1B[9m": "\x1B[29m"
        // Strikethrough
      };
      [...this.activeFormatting].reverse().forEach((formatCode) => {
        const resetCode = formatResetMap[formatCode];
        if (resetCode) {
          closingEscapes.push(resetCode);
        }
      });
    }
    if (this.activeForeground) {
      closingEscapes.push("\x1B[39m");
    }
    if (this.activeBackground) {
      closingEscapes.push("\x1B[49m");
    }
    return closingEscapes.join("");
  }
}
const checkEscapeSequence = (chars, index) => {
  if (!ESCAPES.has(chars[index])) {
    return { isInsideEscape: false, isInsideLinkEscape: false };
  }
  const isInsideEscape = true;
  const possibleLink = chars.slice(index + 1, index + 1 + ANSI_ESCAPE_LINK.length).join("");
  const isInsideLinkEscape = possibleLink === ANSI_ESCAPE_LINK;
  return { isInsideEscape, isInsideLinkEscape };
};
const processAnsiString = (string, options = {}) => {
  const stateTracker = new AnsiStateTracker();
  let currentText = "";
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let escapeBuffer = "";
  let currentUrl = "";
  let isInHyperlink = false;
  const chars = [...string];
  for (let index = 0; index < chars.length; index++) {
    const character = chars[index];
    if (character && ESCAPES.has(character)) {
      if (currentText) {
        const width2 = options.getWidth?.(currentText) ?? 0;
        const segment2 = {
          isEscapeSequence: false,
          isGrapheme: true,
          text: currentText,
          width: width2
        };
        if (isInHyperlink) {
          segment2.isHyperlink = true;
          segment2.hyperlinkUrl = currentUrl;
        }
        if (options.onSegment?.(segment2, stateTracker) === false) {
          return;
        }
        currentText = "";
      }
      isInsideEscape = true;
      escapeBuffer = character;
      const escapeInfo = checkEscapeSequence(chars, index);
      isInsideLinkEscape = escapeInfo.isInsideLinkEscape;
      if (isInsideLinkEscape) {
        let urlEnd = index + 1;
        currentUrl = "";
        while (urlEnd < chars.length) {
          const nextChar = chars[urlEnd];
          if (nextChar === ANSI_ESCAPE_BELL) {
            break;
          }
          currentUrl += nextChar;
          urlEnd += 1;
        }
        currentUrl = currentUrl.slice(4);
        const segment2 = {
          hyperlinkUrl: currentUrl,
          isEscapeSequence: true,
          isGrapheme: false,
          isHyperlink: true,
          isHyperlinkStart: true,
          width: 0
        };
        if (options.onSegment?.(segment2, stateTracker) === false) {
          return;
        }
        index = urlEnd;
        isInHyperlink = true;
        isInsideEscape = false;
        isInsideLinkEscape = false;
        escapeBuffer = "";
        continue;
      }
      if (index + 1 < chars.length && chars[index + 1] === "\\" && isInHyperlink) {
        const segment2 = {
          isEscapeSequence: true,
          isGrapheme: false,
          isHyperlink: true,
          isHyperlinkEnd: true,
          width: 0
        };
        if (options.onSegment?.(segment2, stateTracker) === false) {
          return;
        }
        isInHyperlink = false;
        currentUrl = "";
        index += 1;
        isInsideEscape = false;
        escapeBuffer = "";
        continue;
      }
    }
    if (isInsideEscape) {
      if (escapeBuffer !== character) {
        escapeBuffer += character;
      }
      if (character === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
        stateTracker.processEscape(escapeBuffer);
        const segment2 = {
          isEscapeSequence: true,
          isGrapheme: false,
          text: escapeBuffer,
          width: 0
        };
        if (options.onSegment?.(segment2, stateTracker) === false) {
          return;
        }
        escapeBuffer = "";
      }
      continue;
    }
    currentText += character;
    const width = options.getWidth?.(currentText) ?? 0;
    const segment = {
      isEscapeSequence: false,
      isGrapheme: true,
      text: currentText,
      width
    };
    if (isInHyperlink) {
      segment.isHyperlink = true;
      segment.hyperlinkUrl = currentUrl;
    }
    if (options.onSegment?.(segment, stateTracker) === false) {
      return;
    }
    currentText = "";
  }
  if (currentText) {
    const width = options.getWidth?.(currentText) ?? 0;
    const segment = {
      isEscapeSequence: false,
      isGrapheme: true,
      text: currentText,
      width
    };
    if (isInHyperlink) {
      segment.isHyperlink = true;
      segment.hyperlinkUrl = currentUrl;
    }
    options.onSegment?.(segment, stateTracker);
  }
  if (escapeBuffer) {
    const segment = {
      isEscapeSequence: true,
      isGrapheme: false,
      text: escapeBuffer,
      width: 0
    };
    options.onSegment?.(segment, stateTracker);
  }
};
const wrapAnsiCode = (code) => {
  const escapeChar = ESCAPES.values().next().value;
  return `${escapeChar}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
};
const wrapAnsiHyperlink = (url) => {
  const escapeChar = ESCAPES.values().next().value;
  return `${escapeChar}${ANSI_ESCAPE_LINK}${url}${ANSI_ESCAPE_BELL}`;
};
const preserveAnsi = (rawLines) => {
  if (rawLines.length === 0) {
    return "";
  }
  if (rawLines.length === 1) {
    return rawLines[0];
  }
  let returnValue = "";
  let escapeCode;
  let escapeUrl;
  const preString = rawLines.join("\n");
  const pre = [...preString];
  let preStringIndex = 0;
  for (const [index, character] of pre.entries()) {
    returnValue += character;
    if (ESCAPES.has(character)) {
      const match = RE_ESCAPE_PATTERN.exec(preString.slice(preStringIndex));
      const groups = match?.groups ?? {};
      if (groups.code !== void 0) {
        const code2 = Number.parseFloat(groups.code);
        escapeCode = code2 === END_CODE ? void 0 : code2;
      } else if (groups.uri !== void 0) {
        escapeUrl = groups.uri.length === 0 ? void 0 : groups.uri;
      }
    }
    const code = ANSI_RESET_CODES.get(Number(escapeCode));
    if (pre[index + 1] === "\n") {
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink("");
      }
      if (escapeCode && code) {
        returnValue += wrapAnsiCode(code);
      }
    } else if (character === "\n") {
      if (escapeCode && code) {
        returnValue += wrapAnsiCode(escapeCode);
      }
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink(escapeUrl);
      }
    }
    preStringIndex += character.length;
  }
  return returnValue;
};
const resetAnsiAtLineBreak = (currentLine) => {
  if (!currentLine.includes("\x1B")) {
    return currentLine;
  }
  let result = currentLine;
  if (currentLine.includes("\x1B[30m")) {
    result += "\x1B[39m";
  }
  if (currentLine.includes("\x1B[42m")) {
    result += "\x1B[49m";
  }
  return result;
};
const stringVisibleTrimSpacesRight = (string) => {
  const words = string.split(" ");
  let last = words.length;
  while (last > 0 && getStringWidth(words[last - 1]) === 0) {
    last--;
  }
  if (last === words.length) {
    return string;
  }
  return words.slice(0, last).join(" ") + words.slice(last).join("");
};
const wrapWithBreakAtWidth = (string, width, trim) => {
  if (string.length === 0) {
    return [""];
  }
  if (width <= 0) {
    return [string];
  }
  const rows = [];
  const ansiTracker = new AnsiStateTracker();
  let currentLine = "";
  let currentWidth = 0;
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let escapeBuffer = "";
  for (let index = 0; index < string.length; index++) {
    const char = string[index];
    if (ESCAPES.has(char)) {
      isInsideEscape = true;
      escapeBuffer = char;
      currentLine += char;
      const escapeInfo = checkEscapeSequence([...string], index);
      isInsideLinkEscape = escapeInfo.isInsideLinkEscape;
      continue;
    }
    if (isInsideEscape) {
      escapeBuffer += char;
      currentLine += char;
      if (isInsideLinkEscape) {
        if (char === ANSI_ESCAPE_BELL) {
          isInsideEscape = isInsideLinkEscape = false;
        }
      } else if (char === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
        ansiTracker.processEscape(escapeBuffer);
      }
      continue;
    }
    const charWidth = getStringWidth(char);
    const isSpace = char === " ";
    if (charWidth === 0) {
      currentLine += char;
      continue;
    }
    if (currentWidth + charWidth > width) {
      if (currentLine) {
        rows.push(currentLine + ansiTracker.getEndEscapesForAllActiveAttributes());
      }
      currentLine = ansiTracker.getStartEscapesForAllActiveAttributes();
      currentWidth = getStringWidth(currentLine);
      if (isSpace && trim) {
        while (index < string.length && string[index] === " ") {
          index += 1;
          if (index >= string.length) {
            break;
          }
        }
        if (index < string.length) {
          index--;
        }
        continue;
      }
    }
    currentLine += char;
    currentWidth += charWidth;
    if (currentWidth === width && index < string.length - 1) {
      rows.push(currentLine + ansiTracker.getEndEscapesForAllActiveAttributes());
      currentLine = ansiTracker.getStartEscapesForAllActiveAttributes();
      currentWidth = getStringWidth(currentLine);
      if (index + 1 < string.length && string[index + 1] === " " && trim) {
        index += 1;
        while (index < string.length && string[index] === " ") {
          index += 1;
        }
        index--;
      }
    }
  }
  if (currentLine) {
    rows.push(currentLine + ansiTracker.getEndEscapesForAllActiveAttributes());
  }
  return trim ? rows.map((element) => stringVisibleTrimSpacesRight(element)) : rows;
};
const wrapCharByChar = (string, width, trim) => {
  if (string.length === 0) {
    return [];
  }
  const inputToProcess = trim ? string.trim() : string;
  if (inputToProcess.length === 0) {
    return [];
  }
  const rows = [];
  let currentLine = "";
  let currentWidth = 0;
  processAnsiString(inputToProcess, {
    getWidth: getStringWidth,
    onSegment: (segment, stateTracker) => {
      if (segment.isEscapeSequence) {
        currentLine += segment.text;
      } else {
        const isSpace = segment.text === " ";
        if (segment.width === 0) {
          currentLine += segment.text;
          return true;
        }
        if (currentWidth + segment.width > width) {
          if (currentLine) {
            rows.push(currentLine);
          }
          currentLine = stateTracker.getStartEscapesForAllActiveAttributes();
          currentWidth = 0;
          if (isSpace) {
            if (trim) {
              return true;
            }
            rows.push(stateTracker.getStartEscapesForAllActiveAttributes() + segment.text);
            return true;
          }
        }
        currentLine += segment.text;
        currentWidth += segment.width;
      }
      return true;
    }
  });
  if (currentLine) {
    rows.push(currentLine);
  }
  return trim ? rows.map((row) => stringVisibleTrimSpacesRight(row)) : rows;
};
const wrapWithWordBoundaries = (string, width, trim) => {
  if (string.length === 0) {
    return [];
  }
  const inputToProcess = trim ? string.trim() : string;
  if (inputToProcess.length === 0) {
    return [];
  }
  const tokens = inputToProcess.split(/(?=\s)|(?<=\s)/);
  const rows = [];
  let currentLine = "";
  let currentWidth = 0;
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index];
    const isSpace = /^\s+$/.test(token);
    const tokenVisibleWidth = getStringWidth(token);
    if (token.length === 0) {
      index += 1;
      continue;
    }
    if (trim && isSpace && currentWidth === 0) {
      index += 1;
      continue;
    }
    if (currentWidth + tokenVisibleWidth > width && currentWidth > 0) {
      if (trim) {
        rows.push(stringVisibleTrimSpacesRight(currentLine));
      } else {
        rows.push(currentLine);
      }
      currentLine = "";
      currentWidth = 0;
      continue;
    }
    currentLine += token;
    currentWidth += tokenVisibleWidth;
    index += 1;
  }
  if (currentLine) {
    if (trim) {
      rows.push(stringVisibleTrimSpacesRight(currentLine));
    } else {
      rows.push(currentLine);
    }
  }
  return rows;
};
const wrapAndBreakWords = (string, width, trim) => {
  if (string.length === 0) {
    return [];
  }
  const inputToProcess = trim ? string.trim() : string;
  if (inputToProcess.length === 0) {
    return [];
  }
  const tokens = inputToProcess.split(/(?=\s)|(?<=\s)/);
  const rows = [];
  let currentLine = "";
  let currentWidth = 0;
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index];
    const isSpace = /^\s+$/.test(token);
    const tokenVisibleWidth = getStringWidth(token);
    if (token.length === 0) {
      index += 1;
      continue;
    }
    if (trim && isSpace && currentWidth === 0) {
      index += 1;
      continue;
    }
    if (tokenVisibleWidth > width) {
      if (currentLine) {
        rows.push(resetAnsiAtLineBreak(trim ? stringVisibleTrimSpacesRight(currentLine) : currentLine));
      }
      const brokenLines = wrapWithBreakAtWidth(token, width, trim);
      if (brokenLines.length > 0) {
        for (let index_ = 0; index_ < brokenLines.length - 1; index_++) {
          rows.push(brokenLines[index_]);
        }
        currentLine = brokenLines[brokenLines.length - 1];
        currentWidth = getStringWidth(currentLine);
      } else {
        currentLine = "";
        currentWidth = 0;
      }
      index += 1;
      continue;
    }
    if (currentWidth + tokenVisibleWidth > width && currentWidth > 0) {
      rows.push(resetAnsiAtLineBreak(trim ? stringVisibleTrimSpacesRight(currentLine) : currentLine));
      currentLine = "";
      currentWidth = 0;
      if (trim && isSpace) {
        index += 1;
        continue;
      }
    }
    currentLine += token;
    currentWidth += tokenVisibleWidth;
    index += 1;
  }
  if (currentLine) {
    rows.push(resetAnsiAtLineBreak(trim ? stringVisibleTrimSpacesRight(currentLine) : currentLine));
  }
  return rows;
};
const WrapMode = {
  /**
   * Breaks words at character boundaries to fit the width
   */
  BREAK_AT_CHARACTERS: "BREAK_AT_CHARACTERS",
  /**
   * Breaks lines at word boundaries. If a word is longer than the width, it will be broken.
   */
  BREAK_WORDS: "BREAK_WORDS",
  /**
   * Preserves word boundaries, words are kept intact even if they exceed width
   */
  PRESERVE_WORDS: "PRESERVE_WORDS",
  /**
   * Enforces strict adherence to the width limit by breaking at exact width
   */
  STRICT_WIDTH: "STRICT_WIDTH"
};
const wordWrap = (string, options = {}) => {
  const { removeZeroWidthCharacters = true, trim = true, width = 80, wrapMode = WrapMode.PRESERVE_WORDS } = options;
  if (trim && string.trim() === "") {
    return "";
  }
  let normalizedString = String(string).normalize("NFC").replaceAll("\r\n", "\n");
  if (removeZeroWidthCharacters) {
    normalizedString = normalizedString.replaceAll(RE_ZERO_WIDTH, "");
  }
  const result = normalizedString.split("\n").map((line) => {
    if (trim && line.trim() === "") {
      return "";
    }
    let wrappedLines;
    switch (wrapMode) {
      case WrapMode.BREAK_AT_CHARACTERS: {
        wrappedLines = wrapCharByChar(line, width, trim);
        break;
      }
      case WrapMode.BREAK_WORDS: {
        wrappedLines = wrapAndBreakWords(line, width, trim);
        break;
      }
      case WrapMode.STRICT_WIDTH: {
        wrappedLines = wrapWithBreakAtWidth(line, width, trim);
        break;
      }
      default: {
        wrappedLines = wrapWithWordBoundaries(line, width, trim);
      }
    }
    return preserveAnsi(wrappedLines);
  });
  return result.join("\n");
};

const defaultColumns = 80;
const defaultRows = 24;
const exec = (command, arguments_, { shell, env } = {}) => node_child_process.execFileSync(command, arguments_, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
  timeout: 500,
  shell,
  env
}).trim();
const create = (columns, rows) => ({
  columns: Number.parseInt(columns, 10),
  rows: Number.parseInt(rows, 10)
});
const createIfNotDefault = (maybeColumns, maybeRows) => {
  const { columns, rows } = create(maybeColumns, maybeRows);
  if (Number.isNaN(columns) || Number.isNaN(rows)) {
    return;
  }
  if (columns === defaultColumns && rows === defaultRows) {
    return;
  }
  return { columns, rows };
};
function terminalSize() {
  const { env, stdout, stderr } = process__default;
  if (stdout?.columns && stdout?.rows) {
    return create(stdout.columns, stdout.rows);
  }
  if (stderr?.columns && stderr?.rows) {
    return create(stderr.columns, stderr.rows);
  }
  if (env.COLUMNS && env.LINES) {
    return create(env.COLUMNS, env.LINES);
  }
  const fallback = {
    columns: defaultColumns,
    rows: defaultRows
  };
  if (process__default.platform === "win32") {
    return tput() ?? fallback;
  }
  if (process__default.platform === "darwin") {
    return devTty() ?? tput() ?? fallback;
  }
  return devTty() ?? tput() ?? resize() ?? fallback;
}
const devTty = () => {
  try {
    const flags = process__default.platform === "darwin" ? fs__default.constants.O_EVTONLY | fs__default.constants.O_NONBLOCK : fs__default.constants.O_NONBLOCK;
    const { columns, rows } = tty__default.WriteStream(fs__default.openSync("/dev/tty", flags));
    return { columns, rows };
  } catch {
  }
};
const tput = () => {
  try {
    const columns = exec("tput", ["cols"], { env: { TERM: "dumb", ...process__default.env } });
    const rows = exec("tput", ["lines"], { env: { TERM: "dumb", ...process__default.env } });
    if (columns && rows) {
      return createIfNotDefault(columns, rows);
    }
  } catch {
  }
};
const resize = () => {
  try {
    const size = exec("resize", ["-u"]).match(/\d+/g);
    if (size.length === 2) {
      return createIfNotDefault(size[0], size[1]);
    }
  } catch {
  }
};

const cliBoxes = {
  arrow: {
    bottom: "↑",
    bottomLeft: "↗",
    bottomRight: "↖",
    left: "→",
    right: "←",
    top: "↓",
    topLeft: "↘",
    topRight: "↙"
  },
  bold: {
    bottom: "━",
    bottomLeft: "┗",
    bottomRight: "┛",
    left: "┃",
    right: "┃",
    top: "━",
    topLeft: "┏",
    topRight: "┓"
  },
  classic: {
    bottom: "-",
    bottomLeft: "+",
    bottomRight: "+",
    left: "|",
    right: "|",
    top: "-",
    topLeft: "+",
    topRight: "+"
  },
  double: {
    bottom: "═",
    bottomLeft: "╚",
    bottomRight: "╝",
    left: "║",
    right: "║",
    top: "═",
    topLeft: "╔",
    topRight: "╗"
  },
  doubleSingle: {
    bottom: "═",
    bottomLeft: "╘",
    bottomRight: "╛",
    left: "│",
    right: "│",
    top: "═",
    topLeft: "╒",
    topRight: "╕"
  },
  round: {
    bottom: "─",
    bottomLeft: "╰",
    bottomRight: "╯",
    left: "│",
    right: "│",
    top: "─",
    topLeft: "╭",
    topRight: "╮"
  },
  single: {
    bottom: "─",
    bottomLeft: "└",
    bottomRight: "┘",
    left: "│",
    right: "│",
    top: "─",
    topLeft: "┌",
    topRight: "┐"
  },
  singleDouble: {
    bottom: "─",
    bottomLeft: "╙",
    bottomRight: "╜",
    left: "║",
    right: "║",
    top: "─",
    topLeft: "╓",
    topRight: "╖"
  }
};

const widestLine = (string) => {
  let lineWidth = 0;
  for (const line of string.split("\n")) {
    lineWidth = Math.max(lineWidth, getStringWidth(line));
  }
  return lineWidth;
};

const NEWLINE = "\n";
const PAD = " ";
const NONE = "none";
const getObject = (detail) => {
  if (typeof detail === "number") {
    return {
      bottom: detail,
      left: detail * 3,
      right: detail * 3,
      top: detail
    };
  }
  return {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    ...detail
  };
};
const getBorderWidth = (borderStyle) => borderStyle === NONE ? 0 : 2;
const getBorderChars = (borderStyle) => {
  const sides = ["topLeft", "topRight", "bottomRight", "bottomLeft", "left", "right", "top", "bottom"];
  let characters;
  if (borderStyle === NONE) {
    borderStyle = {};
    for (const side of sides) {
      borderStyle[side] = "";
    }
  }
  if (typeof borderStyle === "string") {
    const cliBox = cliBoxes[borderStyle];
    if (cliBox === void 0) {
      throw new TypeError(`Invalid border style: ${borderStyle}`);
    }
    characters = cliBox;
  } else {
    if (typeof borderStyle.vertical === "string") {
      borderStyle.left = borderStyle.vertical;
      borderStyle.right = borderStyle.vertical;
    }
    if (typeof borderStyle.horizontal === "string") {
      borderStyle.top = borderStyle.horizontal;
      borderStyle.bottom = borderStyle.horizontal;
    }
    for (const side of sides) {
      if (borderStyle[side] === null || typeof borderStyle[side] !== "string") {
        throw new TypeError(`Invalid border style: ${side}`);
      }
    }
    characters = borderStyle;
  }
  return characters;
};
const wrapText = (text, colorizeText, horizontal, colorizeBorder, alignment) => {
  let title = "";
  text = colorizeText(text);
  const textWidth = getStringWidth(text);
  switch (alignment) {
    case "left": {
      title = text + colorizeBorder(horizontal.slice(textWidth), getStringWidth(horizontal.slice(textWidth)));
      break;
    }
    case "right": {
      title = `${colorizeBorder(horizontal.slice(textWidth + 2), getStringWidth(horizontal.slice(textWidth)) + 2)} ${text} `;
      break;
    }
    default: {
      horizontal = horizontal.slice(textWidth);
      if (horizontal.length % 2 === 1) {
        horizontal = horizontal.slice(Math.floor(horizontal.length / 2));
        title = colorizeBorder(horizontal.slice(1), getStringWidth(horizontal.slice(1))) + text + colorizeBorder(horizontal, getStringWidth(horizontal));
      } else {
        horizontal = horizontal.slice(horizontal.length / 2);
        const horizontalLength = getStringWidth(horizontal);
        title = colorizeBorder(horizontal, horizontalLength) + text + colorizeBorder(horizontal, horizontalLength);
      }
      break;
    }
  }
  return title;
};
const makeContentText = (text, { height, padding, textAlignment, width }) => {
  text = alignText(text, { align: textAlignment });
  let lines = text.split(NEWLINE);
  const textWidth = widestLine(text);
  const max = width - padding.left - padding.right;
  if (textWidth > max) {
    const newLines = [];
    for (const line of lines) {
      const createdLines = wordWrap(line, { width: max, wrapMode: WrapMode.BREAK_WORDS });
      const alignedLines = alignText(createdLines, { align: textAlignment });
      const alignedLinesArray = alignedLines.split("\n");
      const longestLength = Math.max(...alignedLinesArray.map((s) => getStringWidth(s)));
      for (const alignedLine of alignedLinesArray) {
        let paddedLine;
        switch (textAlignment) {
          case "center": {
            paddedLine = PAD.repeat((max - longestLength) / 2) + alignedLine;
            break;
          }
          case "right": {
            paddedLine = PAD.repeat(max - longestLength) + alignedLine;
            break;
          }
          default: {
            paddedLine = alignedLine;
            break;
          }
        }
        newLines.push(paddedLine);
      }
    }
    lines = newLines;
  }
  if (textAlignment === "center" && textWidth < max) {
    lines = lines.map((line) => PAD.repeat((max - textWidth) / 2) + line);
  } else if (textAlignment === "right" && textWidth < max) {
    lines = lines.map((line) => PAD.repeat(max - textWidth) + line);
  }
  const paddingLeft = PAD.repeat(padding.left);
  const paddingRight = PAD.repeat(padding.right);
  lines = lines.map((line) => {
    const newLine = paddingLeft + line + paddingRight;
    const remainingWidth = width - getStringWidth(newLine);
    return newLine + PAD.repeat(Math.max(remainingWidth, 0));
  });
  if (padding.top > 0) {
    lines = [...Array.from({ length: padding.top }).fill(PAD.repeat(width)), ...lines];
  }
  if (padding.bottom > 0) {
    lines = [...lines, ...Array.from({ length: padding.bottom }).fill(PAD.repeat(width))];
  }
  if (height && lines.length > height) {
    lines = lines.slice(0, height);
  } else if (height && lines.length < height) {
    lines = [...lines, ...Array.from({ length: height - lines.length }).fill(PAD.repeat(width))];
  }
  return lines.join(NEWLINE);
};
const boxContent = (content, contentWidth, columnsWidth, options) => {
  const colorizeBorder = (border, position, length) => options.borderColor ? options.borderColor(border, position, length) : border;
  const colorizeHeaderText = (title) => options.headerTextColor ? options.headerTextColor(title) : title;
  const colorizeFooterText = (title) => options.footerTextColor ? options.footerTextColor(title) : title;
  const colorizeContent = (value) => options.textColor ? options.textColor(value) : value;
  const chars = getBorderChars(options.borderStyle);
  let marginLeft = PAD.repeat(options.margin.left);
  if (options.float === "center") {
    const marginWidth = Math.max((columnsWidth - contentWidth - getBorderWidth(options.borderStyle)) / 2, 0);
    marginLeft = PAD.repeat(marginWidth);
  } else if (options.float === "right") {
    const marginWidth = Math.max(columnsWidth - contentWidth - options.margin.right - getBorderWidth(options.borderStyle), 0);
    marginLeft = PAD.repeat(marginWidth);
  }
  let result = "";
  if (options.margin.top) {
    result += NEWLINE.repeat(options.margin.top);
  }
  if (options.borderStyle !== NONE || options.headerText) {
    let headerText = colorizeBorder(chars.top.repeat(contentWidth), "top", contentWidth);
    if (options.headerText) {
      headerText = wrapText(
        options.headerText,
        colorizeHeaderText,
        chars.top.repeat(contentWidth),
        (value, length) => colorizeBorder(value, "top", length),
        options.headerAlignment
      );
    }
    const topBorder = colorizeBorder(marginLeft + chars.topLeft, "topLeft", getStringWidth(marginLeft + chars.topLeft));
    result += topBorder + headerText + colorizeBorder(chars.topRight, "topRight", getStringWidth(chars.topRight)) + NEWLINE;
  }
  const lines = content.split(NEWLINE);
  result += lines.map(
    (line) => marginLeft + colorizeBorder(chars.left, "left", getStringWidth(chars.left)) + colorizeContent(line) + colorizeBorder(chars.right, "right", getStringWidth(chars.right))
  ).join(NEWLINE);
  if (options.borderStyle !== NONE || options.footerText) {
    const bottomBorder = NEWLINE + colorizeBorder(marginLeft + chars.bottomLeft, "bottomLeft", getStringWidth(marginLeft + chars.bottomLeft));
    let footerText = colorizeBorder(chars.bottom.repeat(contentWidth), "bottom", contentWidth);
    if (options.footerText) {
      footerText = wrapText(
        options.footerText,
        colorizeFooterText,
        chars.bottom.repeat(contentWidth),
        (value, length) => colorizeBorder(value, "bottom", length),
        options.footerAlignment
      );
    }
    result += bottomBorder + footerText + colorizeBorder(chars.bottomRight, "bottomRight", getStringWidth(chars.bottomRight));
  }
  if (options.margin.bottom) {
    result += NEWLINE.repeat(options.margin.bottom);
  }
  return result;
};
const sanitizeOptions = (options) => {
  if (options.fullscreen) {
    let newDimensions = terminalSize();
    if (typeof options.fullscreen === "function") {
      newDimensions = options.fullscreen(newDimensions.columns, newDimensions.rows);
    }
    if (!options.width) {
      options.width = newDimensions.columns;
    }
    if (!options.height) {
      options.height = newDimensions.rows;
    }
  }
  if (options.width) {
    options.width = Math.max(1, options.width - getBorderWidth(options.borderStyle));
  }
  if (options.height) {
    options.height = Math.max(1, options.height - getBorderWidth(options.borderStyle));
  }
  return options;
};
const formatTitle = (title, borderStyle) => borderStyle === NONE ? title : ` ${title} `;
const determineDimensions = (text, columnsWidth, options) => {
  options = sanitizeOptions(options);
  const widthOverride = options.width !== void 0;
  const borderWidth = getBorderWidth(options.borderStyle);
  const maxWidth = columnsWidth - options.margin.left - options.margin.right - borderWidth;
  const widest = widestLine(wordWrap(text, { trim: false, width: columnsWidth - borderWidth, wrapMode: WrapMode.BREAK_WORDS })) + options.padding.left + options.padding.right;
  if (options.headerText && widthOverride) {
    options.headerText = options.headerText.slice(0, Math.max(0, options.width - 2));
    if (options.headerText) {
      options.headerText = formatTitle(options.headerText, options.borderStyle);
    }
  } else if (options.headerText) {
    options.headerText = options.headerText.slice(0, Math.max(0, maxWidth - 2));
    if (options.headerText) {
      options.headerText = formatTitle(options.headerText, options.borderStyle);
      if (getStringWidth(options.headerText) > widest) {
        options.width = getStringWidth(options.headerText);
      }
    }
  }
  options.width = options.width || widest;
  if (!widthOverride) {
    if (options.margin.left && options.margin.right && options.width > maxWidth) {
      const spaceForMargins = columnsWidth - options.width - borderWidth;
      const multiplier = spaceForMargins / (options.margin.left + options.margin.right);
      options.margin.left = Math.max(0, Math.floor(options.margin.left * multiplier));
      options.margin.right = Math.max(0, Math.floor(options.margin.right * multiplier));
    }
    options.width = Math.min(options.width, columnsWidth - borderWidth - options.margin.left - options.margin.right);
  }
  if (options.width - (options.padding.left + options.padding.right) <= 0) {
    options.padding.left = 0;
    options.padding.right = 0;
  }
  if (options.height && options.height - (options.padding.top + options.padding.bottom) <= 0) {
    options.padding.top = 0;
    options.padding.bottom = 0;
  }
  return options;
};
const boxen = (text, options = {}) => {
  if (options.borderColor !== void 0 && typeof options.borderColor !== "function") {
    throw new Error(`"borderColor" is not a valid function`);
  }
  if (options.textColor !== void 0 && typeof options.textColor !== "function") {
    throw new Error(`"textColor" is not a valid function`);
  }
  let config = {
    borderStyle: "single",
    dimBorder: false,
    float: "left",
    footerAlignment: "right",
    headerAlignment: "left",
    textAlignment: "left",
    transformTabToSpace: 4,
    ...options
  };
  config.padding = getObject(options.padding ?? 0);
  config.margin = getObject(options.margin);
  if (config.transformTabToSpace) {
    text = text.replaceAll("	", " ".repeat(config.transformTabToSpace));
  }
  const { columns } = terminalSize();
  config = determineDimensions(text, columns, config);
  return boxContent(makeContentText(text, config), config.width, columns, config);
};

exports.boxen = boxen;
