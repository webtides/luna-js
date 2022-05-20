const Component = ({selector, target} = {}) => {
	return function decorator(Class) {
		Class.$$luna = {
			...(Class.$$luna ?? {}),
			selector,
			target: target ?? Component.TARGET_SERVER,
		};

		return Class;
	}
};

Component.TARGET_SERVER = 'server';
Component.TARGET_CLIENT = 'client';
Component.TARGET_BOTH = 'both';

const MethodContext = (options) => {
	const methodTarget = options?.target ?? options ?? 'server';

	switch (methodTarget) {
		default:
			return ServerMethod(options);
	}
};

const ServerMethod = (options) => {
	const syncProperties = options?.syncProperties ?? [];

	return (target, name, descriptor) => {
		if (process.env.CLIENT_BUNDLE) {
			descriptor.value = (async function () {
				const context = Object.fromEntries(syncProperties.map((key) => ([
					key,
					this[key]
				])));

				const response = await fetch('#', {
					method: 'POST',
					body: JSON.stringify({context, args: [...arguments]}),
					headers: {
						'Content-Type': 'application/json',
						'X-Server-Method-Id': `${this.tagName.toLowerCase()}.${name}`,
					},
				});

				if (response.status !== 200) {
					throw new Error('Method invocation in different context failed.')
				}

				return response.json();
			});
		}

		if (process.env.SERVER_BUNDLE) {
			target.constructor.$$luna = {
				...(target.contructor?.$$luna ?? {}),
				serverMethods: [
					...(target.constructor?.$$luna?.serverMethods ?? []),
					name,
				]
			}
		}
	}
};

export {Component, MethodContext, ServerMethod};
