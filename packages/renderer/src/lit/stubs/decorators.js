const decorator = () => {
    return function(element) { }
};

const eventOptions = decorator;
const internalProperty = decorator;
const query = decorator;
const queryAll = decorator;
const queryAsync = decorator;
const queryAssignedNodes = decorator;
const customElement = decorator;
const property = decorator;
const state = decorator;

export {
    customElement,
    property,
    state,
    eventOptions,
    internalProperty,
    query,
    queryAll,
    queryAsync,
    queryAssignedNodes,
}
