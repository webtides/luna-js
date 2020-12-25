import { tasks, options } from '@webtides/tasks';
import nodemon from 'gulp-nodemon';
import pkg from 'gulp';
const { task, parallel, series } = pkg;

options({
	projectTitle: 'Express-PostHTML-SSR',
	versionManifest: {
		name: 'public/hash-manifest.json',
		formatter: (name) => {
			return name.replace('public/', '');
		},
	},
});

task('clean', tasks.clean({ paths: ['public/css/*', 'public/elements/*'] }));

task('css', tasks.css({ src: 'src/css/**/*.css', dest: 'public/css/' }));

task(
	'elements',
	tasks.js({
		src: ['packages/client/**/*.js', 'app/views/components/**/*.js'],
		dest: 'public/elements/',
		outputOptions: { entryFileNames: '[name].js', sourcemap: true },
		preferBuiltins: false
	}),
);

task(
	'base-elements',
	tasks.js({
		src: ['packages/client/elements/template-element.js'],
		dest: '.build/public/elements/',
		outputOptions: { entryFileNames: 'BaseTemplateElement.js', sourcemap: true },
	}),
)

task('serve', (cb) => {
	let started = false;
	nodemon({
		script: './src/index.js',
		watch: ['./*.js', './views/**/*.html'],
		nodeArgs: ['--inspect=3003'],
	}).on('start', function () {
		if (!started) {
			cb();
			started = true;
		}
	});
});

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
				src: ['src/elements/**/*.js'],
				tasks: series('elements'),
				changeMessage: 'Elements changed',
			},
		],
	}),
);

task('default', series('clean', parallel('css', 'elements')));
task('dev', series('default', 'serve', 'watch'));
