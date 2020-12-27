import {tasks, options} from '@webtides/tasks';
import nodemon from 'gulp-nodemon';
import pkg from 'gulp';
import run from 'gulp-run'

const {task, parallel, series} = pkg;

const settings = {
    buildDirectory: '.build',
    assetsDirectory: '.build/public/assets'
}

options({
    projectTitle: 'Express-PostHTML-SSR',
    versionManifest: {
        name: settings.assetsDirectory + '/hash-manifest.json',
        formatter: (name) => {
            return name.replace('public/', '');
        },
    },
});

task('clean', tasks.clean({paths: [settings.assetsDirectory + '**/*']}));
task('css', tasks.css({src: 'src/css/**/*.css', dest: settings.assetsDirectory + '/css/'}));

task(
    'elements',
    tasks.js({
        src: ['packages/client/**/*.js', 'app/views/components/**/*.js'],
        dest: settings.assetsDirectory + '/elements',
        outputOptions: {entryFileNames: '[name].js', sourcemap: true},
        commonjsOptions: {
            transformMixedEsModules: true,
            dynamicRequireTargets: [
                'node_modules/@webtides/element-js/**/*.js',
            ],
            include: [
                'node_modules/@webtides/element-js/**/*.js',
            ]
        },
        preferBuiltins: false
    }),
);

task(
    'server',
    tasks.js({
        src: ['packages/framework/entry.js'],
        dest: settings.buildDirectory + '/packages'
    })
)

task('serve', (cb) => {
    let started = false;
    nodemon({
        script: './.build/packages/framework/entry.js',
        watch: ['./.build/**/*'],
        nodeArgs: ['--inspect=3003'],
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

task(
    'compile',
    () => run("npm run compile").exec()
)

task(
    'watch',
    tasks.watch({
        paths: [
            {
                src: ['src/css/**/*.css', 'tailwind.config.js', 'postcss-layouts.js'],
                tasks: series('css'),
                changeMessage: 'CSS changed',
            },
            {
                src: ['app/**/*.js'],
                tasks: series('elements'),
                changeMessage: 'Elements changed',
            },
            {
                src: [ 'packages/**/*' ],
                tasks: series('compile'),
                changeMessage: 'Server files changed'
            }
        ],
    }),
);

task('default', series('clean', parallel('css', 'elements')));
task('dev', series('default', 'compile', 'serve', 'watch'));
