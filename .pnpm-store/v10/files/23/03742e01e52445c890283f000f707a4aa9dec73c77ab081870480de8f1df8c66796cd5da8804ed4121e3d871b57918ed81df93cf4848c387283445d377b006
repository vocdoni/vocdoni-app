import { frontmatterMatcher, scriptBodies } from './compilers.js';
const condition = (hasDependency) => hasDependency('astro');
const compiler = (text, path) => {
    const scripts = [];
    const frontmatter = text.match(frontmatterMatcher);
    if (frontmatter?.[1])
        scripts.push(frontmatter[1]);
    const scriptContent = scriptBodies(text, path);
    if (scriptContent)
        scripts.push(scriptContent);
    return scripts.join('\n');
};
export default { condition, compiler };
