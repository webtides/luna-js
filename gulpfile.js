const path = require("path");
const gulp = require('gulp');
const run = require("gulp-run");
const gulpCopy = require("gulp-copy");

const settings = require(path.join(process.cwd(), "moon.config.js"));


const buildServerComponents = () => {
    return run("rollup --config node_modules/moon.js/rollup.config.components.js").exec();
};

const buildClientComponents = () => {
    return run("rollup --config node_modules/moon.js/rollup.config.client.js", {verbosity: 3}).exec();
};

const libraries = () => {
    return gulp.src(path.resolve(__dirname, "packages/client/libraries/**/*"))
        .pipe(gulpCopy(path.join(settings.publicDirectory, "libraries"), {prefix: 5}))
};

gulp.task("build", gulp.parallel(buildServerComponents, buildClientComponents, librariesA));
