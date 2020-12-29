import postcss from "rollup-plugin-postcss";
import resolve from "rollup-plugin-node-resolve";
import tailwindcss from 'tailwindcss';

const pluginPostcss = ({ inject = false, extract = false } = { }) => {
    return postcss({
        inject,
        extract,
        plugins: [
            require('postcss-import'),
            tailwindcss('tailwind.config.js'),
            require('postcss-preset-env')({ stage: 1 }),
            // ...(isProduction ? [require('cssnano')] : []),
        ],
        extensions: ['.css'],
    });
}

const plugins = () => {
    return [
        resolve(),
        pluginPostcss()
    ]
};

export {
    plugins,
    pluginPostcss
}
