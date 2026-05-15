export { pluginCommon };
import '../../assertEnvVite.js';
const pluginCommon = {
    applyToEnvironment(env) {
        return env.config.consumer === 'server';
    },
    sharedDuringBuild: true,
};
