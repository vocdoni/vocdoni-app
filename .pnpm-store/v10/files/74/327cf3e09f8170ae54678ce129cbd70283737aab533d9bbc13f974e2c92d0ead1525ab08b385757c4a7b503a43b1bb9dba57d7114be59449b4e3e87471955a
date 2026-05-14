export { requireResolve };
import { import_ } from '@brillout/import';
// Workaround for webpack static analysis warnings: (Some users use webpack to bundle their Vike app's server code.)
// ```
// Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
// Critical dependency: the request of a dependency is an expression
// ```
// Just `console.log(require)` already triggers the warnings, so the following seems to be the only way (using eval() shows a warning when using esbuild).
async function requireResolve(id, currentFilePath) {
    const req = await getRequire(currentFilePath);
    return req.resolve(id);
}
/* Not needed since using import_() is equivalent
export { require_ }
async function require_(id: string, currentFilePath: string) {
  const req = await getRequire(currentFilePath)
  return req(id)
}
*/
async function getRequire(currentFilePath) {
    const { createRequire } = (await import_('module'));
    const req = createRequire(currentFilePath);
    return req;
}
/* Debug:
;(async () => {
  console.log('test webpack static analysis suppression trick')
  console.log(await requireResolve('path', __filename))
  console.log(await require_('path'))
})()
//*/
