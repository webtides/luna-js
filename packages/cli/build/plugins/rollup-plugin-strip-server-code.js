const parser = require("@babel/parser");
const traverse = require("@babel/traverse");

module.exports = function () {

    return {
        name: 'luna-strip-server-code',
        async transform(code, id) {
            try {
                const toRemove = [];
                const toReplace = [];

                traverse.default(parser.parse(code, {
                    sourceType: "module",
                    plugins: [
                        "decorators-legacy",
                        "classProperties"
                    ]
                }), {
                    ClassDeclaration(path) {
                        const { node } = path;

                        if (!node.id) {
                            return;
                        }

                        if (node.decorators) {
                            for (const decorator of node.decorators) {
                                if (decorator?.expression?.name === 'HideFromClient') {
                                    toReplace.push({
                                        from: code.substring(node.decorators[0].start, node.end),
                                        to: `export default class {}`
                                    });
                                    break;
                                }
                            }
                        }
                    },
                    ClassProperty(path) {
                        const { node } = path;

                        if (!node.key) {
                            return;
                        }

                        if (node.decorators) {
                            for (const decorator of node.decorators) {
                                if (decorator?.expression?.name === 'HideFromClient') {
                                    toRemove.push(code.substring(node.decorators[0].start, node.end));
                                    break;
                                }
                            }
                        }
                    },
                    ClassMethod(path) {
                        const { node } = path;

                        if (!node.key) {
                            return;
                        }

                        if (node.decorators) {
                            for (const decorator of node.decorators) {
                                if (decorator?.expression?.name === 'HideFromClient') {
                                    toRemove.push(code.substring(node.decorators[0].start, node.end));
                                }
                            }
                        }

                        switch (node.key.name) {
                            case "loadDynamicProperties":
                            case "loadStaticProperties":
                                toRemove.push(code.substring(node.start, node.end));
                                break;
                        }
                    }
                })

                for (const partToRemove of toRemove) {
                    code = code.split(partToRemove).join("");
                }

                for (const partToReplace of toReplace) {
                    code = code.split(partToReplace.from).join(partToReplace.to);
                }
            } catch (error) {
                console.error(error);
            }

            return { code };
        },
    }
}
