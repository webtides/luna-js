import path from 'path';

const importDynamically = async (id) => {
    return id.startsWith('.')
        ? import(path.resolve(process.cwd(), id))
        : import(path.resolve(process.cwd(), `./node_modules/${id}`))
};

export { importDynamically };
