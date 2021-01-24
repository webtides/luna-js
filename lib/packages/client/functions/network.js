"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.apiRequest = void 0;

const getBaseRequestHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

const parseBody = body => {
  if (!body) {
    return undefined;
  }

  let json = body;

  if (body instanceof FormData) {
    json = {};
    body.forEach((value, key) => json[key] = value);
  }

  return JSON.stringify(json);
};

const apiRequest = async (api, {
  method = "GET",
  headers = [],
  body
}) => {
  const parts = api.split("/").filter(part => part.length > 0);

  try {
    const response = await fetch(["api", ...parts].join("/"), {
      method,
      body: parseBody(body),
      headers: { ...getBaseRequestHeaders(),
        ...headers
      }
    });
    const success = response.ok;
    let data;

    switch (response.headers.get("Content-Type")) {
      case "application/json":
        data = await response.json();
        return;

      default:
        data = await response.text();
    }

    return {
      success,
      status: response.status,
      response,
      data
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      error
    };
  }
};

exports.apiRequest = apiRequest;