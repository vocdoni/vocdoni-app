export { getDeployConfig };
import { fromVike } from 'convert-route/vike';
import type { PageConfigPublicWithRoute } from '../../../../shared-server-client/page-configs/resolveVikeConfigPublic.js';
import '../../assertEnvVite.js';
import type { Vercel } from '../../../../types/Config.js';
type RouteIr = ReturnType<typeof fromVike>;
declare function getDeployConfig(pageId: string, page: PageConfigPublicWithRoute): null | {
    route: RouteIr[];
    vercel: Vercel;
};
