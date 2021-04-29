import {render} from './src/render.js';

class Part {
    constructor(value) {
        this.value = value.$$templatePart ? value.value : value;
    }

    encodeAttribute(attribute, preserveCR = false) {
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

    toString() {
        if (typeof this.value !== 'string') {
            return this.encodeAttribute(JSON.stringify(this.value));
        }
        return this.encodeAttribute(this.value);
    }
}

class TemplatePart extends Part {
    $$templatePart = true;

    constructor(value) {
        super(value);
    }

    toString() {
        if (Array.isArray(this.value)) {
            return this.value.map((row) => new TemplatePart(row).toString()).join('');
        } else if (this.value?.$$templateLiteral) {
            return this.value.asChildCycle().toString();
        } else if (typeof this.value === 'function') {
            // A directive
            return this.value();
        } else if (typeof this.value !== 'string') {
            return this.encodeAttribute(this.value.toString());
        }

        return this.encodeAttribute(this.value);
    }
}

class TemplateLiteral {
    $$templateLiteral = true;

    isChildCycle = false;

    constructor(strings, ...keys) {
        const result = [];
        for (let i = 0; i < strings.length; i++) {
            result.push(strings[i]);

            if (i < keys.length) {
                result.push(new TemplatePart(keys[i]));
            }
        }

        this.result = result;
    }

    asChildCycle() {
        this.isChildCycle = true;
        return this;
    }

    toString() {
        const result = this.isChildCycle ? this.result : [ `<!--$$element-->`, ...this.result, `<!--/$$element-->` ];

        return `${result.map(row => {
            return typeof row === 'string' ? row : row.toString()
        }).join('')}`;
    }
}

const html = function (strings, ...keys) {
    return new TemplateLiteral(strings, ...keys);
};

const unsafeHTML = (string) => {
    return () => string;
};

const attr = (attributes) => {
    return () => {
        return Object.keys(attributes)
            .map((key) => {
                return `${key}="${new Part(attributes[key])}"`;
            })
            .join(' ');
    };
}

export {render, html, unsafeHTML, attr};
