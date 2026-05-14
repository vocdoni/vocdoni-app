export { formatHintLog };
import { assert } from './assert.js';
import { stripAnsi } from './colorsServer.js';
function formatHintLog(msg) {
    assert(msg.length > 0);
    const msgLength = stripAnsi(msg).length;
    const sep = '─'.repeat(msgLength);
    const top = `┌─${sep}─┐\n`;
    const mid = `│ ${msg} │\n`;
    const bot = `└─${sep}─┘`;
    const msgWrapped = `${top}${mid}${bot}`;
    return msgWrapped;
}
