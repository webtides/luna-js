export default function ({ components }) {
    return (tree) => {
        return new Promise((resolve) => {
            tree.match({ tag: 'html' }, (node) => {

                const toInject = [
                    '<script type="module">',
                ]


                toInject.push(
                    '</script>'
                );

                return node;
            });
        });
    };
};
