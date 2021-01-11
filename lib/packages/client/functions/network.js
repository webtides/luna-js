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

const apiRequest = async (api, {
  method = "GET",
  headers = []
}) => {
  const parts = api.split("/").filter(part => part.length > 0);

  try {
    const response = await fetch(["api", ...parts].join("/"), {
      method,
      headers: { ...getBaseRequestHeaders(),
        ...headers
      }
    });

    if (response.ok) {
      return {
        success: true,
        response,
        data: await response.json()
      };
    }

    return {
      success: false,
      response
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
};

exports.apiRequest = apiRequest;