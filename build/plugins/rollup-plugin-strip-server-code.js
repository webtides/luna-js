const acorn = require("acorn");
const walk = require("acorn-walk");

export default function () {
    return {
        name: 'moon-strip-server-code',
        transform(code, id) {
            // Only strip server code of actual elements.
            if (code.indexOf("TemplateElement") === -1) {
                return;
            }

            const toRemove = [ ];

            walk.simple(acorn.parse(code, {sourceType: "module", ecmaVersion: "latest"}), {
                MethodDefinition(node) {
                    if (!node.key) {
                        return;
                    }

                    switch (node.key.name) {
                        case "loadDynamicProperties":
                        case "loadStaticProperties":
                            toRemove.push(code.substring(node.start, node.end));
                            break;
                    }
                },
            });

            for (const partToRemove of toRemove) {
                code = code.split(toRemove).join("");
            }

            return { code };
        },
    }
}
