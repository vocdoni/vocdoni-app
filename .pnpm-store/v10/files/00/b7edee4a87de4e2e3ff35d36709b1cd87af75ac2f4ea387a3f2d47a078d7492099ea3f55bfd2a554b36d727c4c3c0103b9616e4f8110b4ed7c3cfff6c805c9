// Zero-config support for https://www.npmjs.com/package/react-streaming
export { isStreamFromReactStreamingPackage };
export { streamFromReactStreamingPackageToString };
export { getStreamOfReactStreamingPackage };
import { assert, assertUsage } from '../../../../../utils/assert.js';
import { hasProp } from '../../../../../utils/hasProp.js';
import { isVikeReactApp } from '../../../../../utils/isVikeReactApp.js';
import { streamPipeNodeToString, streamReadableWebToString } from '../stream.js';
import '../../../../assertEnvServer.js';
function streamFromReactStreamingPackageToString(stream) {
    if (stream.pipe) {
        return streamPipeNodeToString(stream.pipe);
    }
    if (stream.readable) {
        return streamReadableWebToString(stream.readable);
    }
    assert(false);
}
function isStreamFromReactStreamingPackage(thing) {
    if (hasProp(thing, 'injectToStream', 'function')) {
        assertUsage(hasProp(thing, 'hasStreamEnded', 'function'), isVikeReactApp()
            ? //
                'Update vike-react to its latest version'
            : 'Update react-streaming to its latest version');
        return true;
    }
    return false;
}
function getStreamOfReactStreamingPackage(stream) {
    if (stream.pipe) {
        return { __streamPipeNode: stream.pipe };
    }
    if (stream.readable) {
        return stream.readable;
    }
    assert(false);
}
