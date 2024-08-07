import traverse from '@babel/traverse';
import * as types from '@babel/types';
import * as recast from 'recast';

const decoratorsWhichRemoveFunctions = ['HideFromClient', 'CurrentRequest', 'Inject'];
const decoratorsWhichRemoveFunctionContents = ['MethodContext', 'ServerMethod'];

export const rollupPluginStripServerCode = function () {
	return {
		name: 'luna-strip-server-code',

		async transform(code, id) {
			try {
				if (
					id.indexOf('node_modules') !== -1 ||
					id === '\x00rollupPluginBabelHelpers.js' ||
					id.indexOf('commonjs') !== -1 ||
					id.endsWith('.css')
				) {
					// We don't need to go through all node_modules
					// and parse the code.
					return { code, map: null };
				}

				const ast = recast.parse(code, {
					sourceFileName: id,
					parser: await import('recast/parsers/babel.js'),

					sourceType: 'module',
					plugins: ['decorators-legacy', 'classProperties'],
				});

				traverse.default(ast, {
					ClassDeclaration(path) {
						const { node } = path;

						if (!node.id || !node.decorators) {
							return;
						}

						// Remove the whole class declaration.
						for (const decorator of node.decorators) {
							if (
								decoratorsWhichRemoveFunctions.includes(decorator?.expression?.name ?? '') ||
								decoratorsWhichRemoveFunctions.includes(decorator?.expression?.callee?.name ?? '')
							) {
								path.replaceWith(
									types.classDeclaration(
										types.identifier('__hidden__'),
										null,
										types.classBody([]),
										null,
									),
								);
								break;
							}
						}
					},

					ClassProperty(path) {
						const { node } = path;

						if (!node.key || !node.decorators) {
							return;
						}

						// Remove the whole property and not just the decorator.
						for (const decorator of node.decorators) {
							if (decoratorsWhichRemoveFunctions.includes(decorator?.expression?.name ?? '')) {
								path.remove();
								break;
							}
						}
					},

					ClassMethod(path) {
						const { node } = path;

						if (!node.key) {
							return;
						}

						for (const decorator of node.decorators ?? []) {
							const decoratorName =
								decorator?.expression?.callee?.name ?? decorator?.expression?.name ?? '';

							if (decoratorsWhichRemoveFunctions.includes(decoratorName)) {
								path.remove();
							}

							if (decoratorsWhichRemoveFunctionContents.includes(decoratorName)) {
								node.body.body = [];
							}
						}

						switch (node.key.name) {
							case 'loadDynamicProperties':
							case 'loadStaticProperties':
								path.remove();
								break;
						}
					},

					Decorator(path) {
						const calleeName = path.node?.expression?.callee?.name;
						if (calleeName === 'Component' || calleeName === 'Inject') {
							path.remove();
						}
					},
				});

				const result = recast.print(ast, { sourceMapName: id.replace('.js', '.js.map') });

				return {
					code: result.code,
					// Rollup only needs the mappings to work with the source map.
					map: { mappings: result.map.mappings },
				};
			} catch (error) {
				console.error(error);
			}

			return { code, map: null };
		},
	};
};
