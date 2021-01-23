const getBaseRequestHeaders = ({ contentType = "application/json" } = { }) => {
    const headers = { };

    if (contentType) {
        headers['Content-Type'] = contentType;
    }

    return headers;
}

const getContentTypeFromBody = (body) => {
    if (body instanceof FormData) {
        return false;
    }

    return "application/json";
}


const apiRequest = async (api, { method = "GET", headers = [], body }) => {
    const parts = api.split("/").filter(part => part.length > 0);

    try {
        const response = await fetch([ "api", ...parts ].join("/"), {
            method,
            body,
            headers: {
                ...getBaseRequestHeaders({
                    contentType: getContentTypeFromBody(body)
                }),
                ...headers
            }
        });

        const success = response.ok;

        return {
            success,
            status: response.status,
            response,
            data: await response.json()
        };

    } catch (error) {
        return { success: false, status: 500, error };
    }
};


export {
    apiRequest
}
