export { getFileSuffixes };
export { suffixesAssertFileEnv };
const suffixesAssertFileEnv = [
    // .server.js
    'server',
    // .client.js
    'client',
    // .ssr.js
    'ssr',
];
const suffixes = [
    ...suffixesAssertFileEnv,
    // .shared.js
    'shared',
    // .clear.js
    'clear',
    // .default.js
    'default',
];
function getFileSuffixes(fileName) {
    return suffixes.filter((suffix) => fileName.includes(`.${suffix}.`));
}
