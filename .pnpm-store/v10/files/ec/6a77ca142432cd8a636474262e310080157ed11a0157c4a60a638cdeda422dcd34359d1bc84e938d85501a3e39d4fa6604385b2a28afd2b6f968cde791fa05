export { getTagAttributesString };
function getTagAttributesString(tagAttributes) {
    const tagAttributesString = Object.entries(tagAttributes)
        .filter(([_key, value]) => value !== false && value !== null && value !== undefined)
        .map(([key, value]) => `${ensureIsValidAttributeName(key)}=${JSON.stringify(String(value))}`)
        .join(' ');
    if (tagAttributesString.length === 0)
        return '';
    return ` ${tagAttributesString}`;
}
function ensureIsValidAttributeName(str) {
    if (/^[a-z][a-z0-9\-]*$/i.test(str) && !str.endsWith('-'))
        return str;
    throw new Error(`Invalid HTML tag attribute name ${JSON.stringify(str)}`);
}
