export default function (options = {}) {
    return (tree) => {
        return new Promise((resolve) => {
            let customElementsToUpgrade = 0;

            const checkIfDone = () => {
                if (customElementsToUpgrade === 0)
                    resolve(tree);
            }

            tree.walk((node) => {
                if (node.tag && node.tag.includes('-')) {
                    customElementsToUpgrade++;

                    if (typeof options.onCustomElementDomNode === 'function') {
                        options.onCustomElementDomNode(node)
                            .then(() => {
                                customElementsToUpgrade--;
                                checkIfDone();
                            })
                    }
                }

                return node;
            });

            checkIfDone();
        });
    };
};
