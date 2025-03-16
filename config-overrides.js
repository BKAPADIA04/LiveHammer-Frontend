const path = require('path');

module.exports = function override(config) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify'),
        crypto: require.resolve('crypto-browserify'),
    };
    return config;
};
