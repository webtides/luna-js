const encodeAttribute = (attribute, preserveCR = false) => {
    preserveCR = preserveCR ? '&#13;' : '\n';
    return `${attribute}`
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, preserveCR);
}

const html = function (strings, ...keys) {
    let result = [];
    for (let i = 0; i < strings.length; i++) {
        result.push(strings[i]);

        if (i < keys.length) {
            if (typeof keys[i] === 'string') {
                // We are between two " ", so we are probably dealing with an attribute.
                if (strings[i + 1] && (strings[i].endsWith("\"") || strings[i].endsWith("'")) &&
                    (strings[i + 1].startsWith("\"") || strings[i + 1].startsWith("'"))) {
                    result.push(encodeAttribute(keys[i]));
                } else {
                    result.push(keys[i]);
                }
            } else if (Array.isArray(keys[i])) {
                result.push(keys[i].join(''));
            } else {
                result.push(keys[i]?.toString());
            }
        }
    }

    return result.join('');
};

export { html };
