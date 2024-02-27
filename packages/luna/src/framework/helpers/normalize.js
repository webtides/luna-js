/**
 * Removes the trailing slash from the domain and from the context.
 * Adds a slash to the beginning of the context path.
 *
 * @param settings {{ domain: string, context: string }}
 *
 * @returns {{domain: *, context: string}}
 */
const normalizeDomainAndContext = (settings) => {
	let { domain, context } = settings;
	context = context || '';

	if (context.endsWith('/')) {
		context = context.substring(0, context.length - 1);
	}

	if (context.length > 0 && !context.startsWith('/')) {
		context = `/${context}`;
	}

	domain = domain || '';

	if (domain.endsWith('/')) {
		domain = domain.substring(0, domain.length - 1);
	}

	return Object.assign(settings, { domain, context });
};

export { normalizeDomainAndContext };
