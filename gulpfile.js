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

const runPrepareScript = () => {
    return run(`node ${path.join(currentDirectory, ".bin/prepare.js")}`).exec();
};

const buildClientComponents = () => {
    return run(`rollup --config ${path.join(currentDirectory, "rollup.config.client.js")}`).exec();
};

const buildLegacyClientComponents = () => {
    return run(`rollup --config ${path.join(currentDirectory, "rollup.config.client.legacy.js")}`).exec();
};

const libraries = () => {
    return gulp
        .src(path.resolve(__dirname, "packages/client/libraries/**/*"))
        .pipe(gulp.dest(path.join(settings.publicDirectory, "libraries")));
};

const compileServerCode = () => {
    return run(`npm run babel && npm run compile`).exec();
}

gulp.task("prepare", gulp.series(compileServerCode));
gulp.task("build", gulp.series(runPrepareScript, gulp.parallel(buildServerComponents, buildClientComponents, buildLegacyClientComponents, libraries)));
