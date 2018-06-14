const config = require('./../config');
const https = require('https');

function get(token, path, headers) {
    if (config.devMode) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    let data = '';

    if (!headers){
        headers = { 'authorization': 'Bearer ' + token };
    }
    return new Promise((fulfill, reject) => {
        https.get({
            host: config.apiUrlHost,
            port: config.apiUrlPort,
            path: '/api/' + path,
            headers: headers
        },
            (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data = data + chunk;
                });

                res.on('end', () => {
                    fulfill(data);
                });

                res.on('error', (err) => reject(err));
            }
        )
    });
}

function getApiPipe(token, path) {
    if (config.devMode) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    let data = '';
    return new Promise((fulfill, reject) => {
        https.get({
            host: config.apiUrlHost,
            port: config.apiUrlPort,
            path: '/api/' + path,
            headers: { 'authorization': 'Bearer ' + token }
        },
            (res) => {
                fulfill(res);
            }
        )
    });
}

function getPipe(token, path) {
    if (config.devMode) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    let data = '';
    return new Promise((fulfill, reject) => {
        https.get({
            host: config.apiUrlHost,
            port: config.apiUrlPort,
            path: path,
            headers: { 'authorization': 'Bearer ' + token }
        },
            (res) => {
                fulfill(res);
            }
        )
    });
}

module.exports = {
    get,
    getApiPipe,
    getPipe
}