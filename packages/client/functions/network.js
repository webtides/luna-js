const getBaseRequestHeaders = () => {
    return {
        'Content-Type': 'application/json'
    }
}

const parseBody = body => {
    if (!body) {
        return undefined;
    }

    let json = body;

    if (body instanceof FormData) {
        json = { };
        body.forEach((value, key) => json[key] = value);
    }

    return JSON.stringify(json);
};


const apiRequest = async (api, { method = "GET", headers = [], body } = {}) => {
    const parts = api.split("/").filter(part => part.length > 0);

    try {
        const response = await fetch(window.luna.api([...parts ].join("/")), {
            method,
            body: parseBody(body),
            headers: {
                ...getBaseRequestHeaders(),
                ...headers
            }
        });

        const success = response.ok;

        let data;

        const contentType = response.headers.get("Content-Type");
        if (contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        return {
            success,
            status: response.status,
            response,
            data
        };

    } catch (error) {
        return { success: false, status: 500, error };
    }
};


export {
    apiRequest
}
