const path = require("path");
const fs = require('fs');
const gulp = require('gulp');
const run = require("gulp-run");
const gulpCopy = require("gulp-copy");

const hasMoonConfigFile = fs.existsSync(path.join(process.cwd(), "moon.config.js"));
const currentDirectory = __dirname;

const settings = hasMoonConfigFile
    ? require(path.join(process.cwd(), "moon.config.js"))
    : require(path.join(currentDirectory, "moon.config.default.js"));

const buildServerComponents = () => {
    return run(`rollup --config ${path.join(currentDirectory, "rollup.config.components.js")}`).exec();
};

const buildClientComponents = () => {
    return run(`rollup --config ${path.join(currentDirectory, "rollup.config.client.js")}`).exec();
};

const libraries = () => {
    return gulp.src(path.resolve(__dirname, "packages/client/libraries/**/*"))
        .pipe(gulpCopy(path.join(settings.publicDirectory, "libraries"), {prefix: 5}))
};

const compileServerCode = () => {
    return run(`npm run babel && npm run compile`).exec();
}

gulp.task("prepare", gulp.parallel(compileServerCode));
gulp.task("build", gulp.parallel(buildServerComponents, buildClientComponents, libraries));
