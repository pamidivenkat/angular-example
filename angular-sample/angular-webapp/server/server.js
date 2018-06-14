'use strict';
require('newrelic');
const Path = require('path');
const Hapi = require('hapi');
const {
    downloadAsAttachment,
    streamFile
} = require('./document/document.service');
const {
    getPipe,
    getApiPipe
} = require('./common/rest.service');
const Config = require('./config')

// Create a server with a host and port
const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, '../dist')
            }
        }
    }
});

server.connection({
    port: 8000
});

server.register(require('vision'), (err) => {

    if (err) {
        throw err;
    }

    server.views({
        engines: {
            html: require('handlebars')
        },
        path: './dist'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function(request, reply) {
            reply.view('index', Config);
        }
    });

    server.route({
        method: 'GET',
        path: '/authcallback.html',
        handler: function(request, reply) {
            reply.file('authcallback.html');
        }
    });

    server.route({
        method: 'GET',
        path: '/silentauthcallback.html',
        handler: function(request, reply) {
            reply.file('silentauthcallback.html');
        }
    });
    
    server.route({
        method: 'GET',
        path: '/locallogout.html',
        handler: function(request, reply) {
            reply.file('locallogout.html');
        }
    });

    server.route({
        method: 'GET',
        path: '/{filename*}',
        handler: function(request, reply) {
            reply.view('index', Config);
        }
    });
});

// Add the route
server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/assets/{filename*}',
        handler: function(request, reply) {
            var filePath = Path.join('assets', request.params.filename);
            reply.file(filePath);
        }
    });

    server.route({
        method: 'GET',
        path: '/{filename}.{ext}',
        handler: function(request, reply) {
            reply.file(request.params.filename + '.' + request.params.ext);
        }
    });
});

server.route({
    method: 'GET',
    path: '/filedownload',
    config: {
        state: {
            parse: true,
            failAction: 'error'
        }
    },
    handler: function(request, reply) {
        if (!request.state.token && !request.headers.pdfgenerator) {
            reply("No token available").code(500);
        } else {
            downloadAsAttachment(request, reply);
        }
    }
});

server.route({
    method: 'GET',
    path: '/training/launch/{module}/{filePath*}',
    config: {
        state: {
            parse: true,
            failAction: 'error'
        }
    },
    handler: function(request, reply) {
        if (!request.state.token) {
            reply("No token available").code(500);
        }

        streamFile(request, reply);
    }
});

server.route({
    method: 'GET',
    path: '/employeeexport',
    config: {
        state: {
            parse: true,
            failAction: 'error'
        },
        handler: function(request, reply) {
            if (!request.state.token) {
                reply("No token available").code(500);
            }

            getApiPipe(request.state.token, request.raw.req.url).then((res) => reply(res));
        }
    }
});

server.route({
    method: 'GET',
    path: '/documentproducer/downloadword/{id*}',
    config: {
        state: {
            parse: true,
            failAction: 'error'
        },
        handler: function(request, reply) {
            if (!request.state.token) {
                reply("No token available").code(500);
            }

            getPipe(request.state.token, request.raw.req.url).then((res) => reply(res), (reason) => reply(reason));
        }
    }
});

server.route({
    method: 'GET',
    path: '/documentproducer/downloadpdf/{id*}',
    config: {
        state: {
            parse: true,
            failAction: 'error'
        },
        handler: function(request, reply) {
            if (!request.state.token) {
                reply("No token available").code(500);
            }

            getPipe(request.state.token, request.raw.req.url).then((res) => reply(res), (reason) => reply(reason));
        }
    }
});

server.route({
    method: 'GET',
    path: '/documentproducer/preview/{id*}',
    config: {
        state: {
            parse: true,
            failAction: 'error'
        },
        handler: function(request, reply) {
            if (!request.state.token) {
                reply("No token available").code(500);
            }

            getPipe(request.state.token, request.raw.req.url).then((res) => reply(res), (reason) => reply(reason));
        }
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});