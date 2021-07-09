const parser = require("@babel/parser");
const traverse = require("@babel/traverse");

const decoratorsToHideFromClient = [
    'HideFromClient',
    'CurrentRequest',
    'Inject'
];

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

                        if (!node.id || !node.decorators) {
                            return;
                        }

                        for (const decorator of node.decorators) {
                            if (decoratorsToHideFromClient.includes(decorator?.expression?.name ?? '') ||
                                decoratorsToHideFromClient.includes(decorator?.expression?.callee?.name ?? '')) {

                                let replaceWith = `export default null`;

                                const classDeclaration = code.substring(node.start, node.id.start);
                                if (classDeclaration.indexOf('export default') === -1) {
                                    replaceWith = ``
                                }

                                toReplace.push({
                                    from: code.substring(node.decorators[0].start, node.end),
                                    to: replaceWith
                                });

                                break;
                            }

                            // Remove the component decorator from the client code
                            if (decorator?.expression?.callee?.name === 'Component' ||
                                decorator?.expression?.name === 'Component') {
                                toReplace.push({
                                    from: code.substring(decorator.start, decorator.end),
                                    to: '',
                                });
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
                                if (decoratorsToHideFromClient.includes(decorator?.expression?.name ?? '')) {
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
                                if (decoratorsToHideFromClient.includes(decorator?.expression?.name ?? '')) {
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

                for (const partToReplace of toReplace) {
                    code = code.split(partToReplace.from).join(partToReplace.to);
                }

                for (const partToRemove of toRemove) {
                    code = code.split(partToRemove).join("");
                }

            } catch (error) {
                console.error(error);
            }

            return { code };
        },
    }
}
