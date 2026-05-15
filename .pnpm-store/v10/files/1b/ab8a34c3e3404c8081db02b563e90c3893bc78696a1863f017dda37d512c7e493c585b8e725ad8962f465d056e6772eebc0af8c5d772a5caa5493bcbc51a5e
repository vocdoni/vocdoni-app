export { getFilesystemRouteString };
export { getFilesystemRouteDefinedBy };
export { isInherited };
export { getLocationId };
export { sortAfterInheritanceOrder };
export { applyFilesystemRoutingRootEffect };
export type { LocationId };
export { getLogicalPath };
import '../../assertEnvVite.js';
/**
 * The `locationId` value is used for filesystem inheritance.
 *
 * Each config value is assigned with a `locationId` value. That's the source-of-truth for determining inheritance between config values.
 *
 * For Vike extensions, `locationId` is different than the config value's `definedAtFilePath`, for example the `onRenderHtml()` hook of `vike-react`:
 *  - `locationId === '/pages'` (the directory of `/pages/+config.js` which extends `vike-react`)
 *  - `definedAtFilePath.filePathAbsoluteFilesystem === '/home/rom/code/my-vike-app/node_modules/vike-react/dist/renderer/onRenderHtml.js'` (the file where the value is defined)
 *
 *  This is an important distinction because the Vike extension's config should only apply to where it's being extended from, for example:
 *  ```js
 *  // /pages/admin/+config.js
 *  import vikeVue from 'vike-vue/config'
 *  // Should only apply to /pages/admin/**
 *  export default { extends: [vikeVue] }
 *  ```
 *  ```js
 *  // /pages/marketing/+config.js
 *  import vikeReact from 'vike-react/config'
 *  // Should only apply to /pages/marketing/**
 *  export default { extends: [vikeReact] }
 *  ```
 */
type LocationId = string & {
    __brand: 'LocationId';
};
/**
 * `getLocationId('/pages/some-page/+Page.js')` => `'/pages/some-page'`
 * `getLocationId('/renderer/+config.js')` => `'/renderer'`
 *
 * The value `locationId` is always a user-land path, because Filesystem Routing/Inheritance only applies to the user-land (Vike never uses Filesystem Routing/Inheritance for `node_modules/**`).
 */
declare function getLocationId(filePathAbsoluteUserRootDir: string): LocationId;
/** Filesystem Routing: get the URL */
declare function getFilesystemRouteString(locationId: LocationId): string;
/**
 * getLogicalPath('/pages/some-page', ['pages']) => '/some-page'
 */
declare function getLogicalPath(locationId: LocationId, ignoredDirs: string[], removeParenthesesDirs?: true): string;
declare function sortAfterInheritanceOrder(locationId1: LocationId, locationId2: LocationId, locationIdPage: LocationId): -1 | 1 | 0;
/** Whether configs defined at `locationId1` also apply at `locationId2` */
declare function isInherited(locationId1: LocationId, locationId2: LocationId): boolean;
declare function getFilesystemRouteDefinedBy(locationId: LocationId): string;
declare function applyFilesystemRoutingRootEffect(routeFilesystem: string, filesystemRoutingRootEffect: {
    before: string;
    after: string;
}): string;
