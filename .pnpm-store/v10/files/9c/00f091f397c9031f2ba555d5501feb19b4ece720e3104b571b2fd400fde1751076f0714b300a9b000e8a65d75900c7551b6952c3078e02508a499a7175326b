export { build_ as build };
export { dev_ as dev };
export { preview_ as preview };
export { prerender_ as prerender };
import './assertEnvApiDevAndProd.js';
const build_ = async (...args) => (await import('./build.js')).build(...args);
const dev_ = async (...args) => (await import('./dev.js')).dev(...args);
const preview_ = async (...args) => (await import('./preview.js')).preview(...args);
const prerender_ = async (...args) => (await import('./prerender.js')).prerender(...args);
