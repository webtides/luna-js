import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const importDynamically = async (id) => {
	console.log({ url: require.resolve(id) });

	return require.resolve(id);
};

export { importDynamically };
