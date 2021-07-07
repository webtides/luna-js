import factory from "../layouts/base.js"

const layout = async page => {
    return factory(page, {
        title: "Welcome"
    })
};

export { layout }

export default () => {
    return `
        <h1>Welcome to luna-js</h1>
        
        <example-component name="webtides"></example-component>
    `;
};
