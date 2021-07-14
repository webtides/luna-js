export default function() {
    return {
        name: 'luna-renderer-dynamic-require',

        load(id) {
            console.log("LOAD MODULE", id);

            if (id === 'module') {
                return `
                    const createRequire = () => require;
                    export { createRequire };
                `;
            }

            return null;
        },
    }
}
