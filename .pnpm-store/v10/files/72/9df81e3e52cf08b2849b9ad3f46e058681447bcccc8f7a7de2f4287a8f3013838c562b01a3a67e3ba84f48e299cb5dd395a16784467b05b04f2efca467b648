export { getPageContextPublicServer };
import { assertPropertyGetters, getPageContextPublicShared, } from '../../../shared-server-client/getPageContextPublicShared.js';
import '../../assertEnvServer.js';
function getPageContextPublicServer(pageContext) {
    // TO-DO/next-major-release: after we remove supportVueReactiviy() we can call this later inside the agnostic getPageContextPublicShared()
    assertPropertyGetters(pageContext);
    const pageContextPublic = getPageContextPublicShared(pageContext);
    return pageContextPublic;
}
