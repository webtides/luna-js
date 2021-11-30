const path = require('path');

const requireDynamically = (id) => {
    return id.startsWith('.')
        ? require(path.resolve(process.cwd(), id))
        : require(path.resolve(process.cwd(), `./node_modules/${id}`))
};

module.exports = {
    requireDynamically
};
