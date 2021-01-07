"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadFromCache = exports.writeToCache = exports.clearCache = void 0;
let cache = {};

const clearCache = () => {
  Object.keys(require.cache).forEach(key => delete require.cache[require.resolve(key)]);
  cache = {};
};

exports.clearCache = clearCache;

const loadFromCache = async (key, group = "default", defaultValue = false) => {
  if (cache[group] && cache[group][key]) {
    console.log("Cache hit", {
      key,
      group
    });
    return cache[group][key];
  }

  return defaultValue;
};

exports.loadFromCache = loadFromCache;

const writeToCache = async (key, value, group = "default") => {
  if (!cache[group]) {
    cache[group] = {};
  }

  cache[group][key] = value;
};

exports.writeToCache = writeToCache;