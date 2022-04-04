const layout = (page, context = {}) => {
	const now = Date.now();

	return `
        <!doctype html>
        <html lang="">
            <head>
                <title>${context.title ?? ''}</title>

                <meta charset="UTF-8"/>
                <link href="/assets/css/main.css?${now}" type="text/css" rel="stylesheet"/>
                <link href="/assets/css/base.css?${now}" type="text/css" rel="stylesheet"/>
                <meta name="viewport" content="width=device-width, initial-scale=1">

                ${context.head ?? ''}
            </head>
            <body>
                <header>

                </header>
                <main>
                    ${page ?? ''}
                </main>
            </body>
        </html>
    `;
};

export default layout;
