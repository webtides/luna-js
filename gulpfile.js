const path = require("path");
const fs = require('fs');
const gulp = require('gulp');
const run = require("gulp-run");
const nodemon = require("gulp-nodemon");

const hasMoonConfigFile = fs.existsSync(path.join(process.cwd(), "moon.config.js"));
const workingDirectory = process.cwd();
const currentDirectory = __dirname;

const settings = hasMoonConfigFile
    ? require(path.join(process.cwd(), "moon.config.js"))
    : require(path.join(currentDirectory, "moon.config.empty.js"));

gulp.task('serve', (cb) => {
    let started = false;
    nodemon({
        script: path.join(currentDirectory, 'lib/packages/framework/entry.js'),
        watch: [ path.join(currentDirectory, "lib/**/*"), path.join(workingDirectory, "views/**/*") ],
        nodeArgs: ['--inspect=3003', '--harmony'],
        env: {
            SSR: true
        }
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    });
});

const runPrepareScript = () => {
    return run(`node ${path.join(currentDirectory, ".bin/prepare.js")}`).exec();
};

const runCommand = (command) => {
    console.log("Run command", command);

    return run(command).exec("", (stderr, stdout) => {
        stderr && console.log(stderr);
        stdout && console.log(stdout);
    });
}

const buildServerComponents = (config = { }) => function buildServerComponents() {
    return runCommand(`rollup --config ${path.join(currentDirectory, "rollup.config.components.js")} ${config.watch ? "-w" : ""}`);
};

const buildClientComponents = (config = { }) => function buildClientComponents() {
    return runCommand(`rollup --config ${path.join(currentDirectory, "rollup.config.client.js")} ${config.watch ? "-w" : ""}`);
};

const libraries = () => {
    return gulp
        .src(path.resolve(__dirname, "packages/client/libraries/**/*"))
        .pipe(gulp.dest(path.join(settings.publicDirectory, "libraries")));
};

const compileServerCode = () => {
    return run(`npm run compile`).exec();
};


gulp.task("build", gulp.series(runPrepareScript, gulp.series(buildServerComponents(), buildClientComponents(), libraries)));

gulp.task("watch", gulp.parallel(
    buildClientComponents({ watch: true }),
));

gulp.task("dev-server", (cb) => gulp.watch([ "packages/**/*" ], { ignoreInitial: false }, gulp.series(compileServerCode)));
gulp.task("dev", gulp.series(runPrepareScript, libraries, "serve", "watch"));
