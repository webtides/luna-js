import postcss from "rollup-plugin-postcss";
import resolve from "rollup-plugin-node-resolve";

const plugins = () => {
    return [
        postcss({ inject: false }),
        resolve(),
    ]
};

export {
    plugins
}
