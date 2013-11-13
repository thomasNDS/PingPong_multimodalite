var MMServer = {
    fs: require('fs')
    , express: require('express')
    , io: require('socket.io')
    , app: null
    , platforms: {}
    , observers: {}
    , disconnect: function(socket) {
        if (this.platforms[socket.id]) {
            delete this.platforms[socket.id];
        }
        if (this.observers[socket.id]) {
            delete this.observers[socket.id];
        }
        for (var i in this.observers) {
            this.observers[i].socket.emit('disappear', {id: socket.id});
        }
    }
    , connection: function(socket) {
        var ptf = {socket: socket};
        this.platforms[socket.id] = ptf;
    }
    , mode: function(socket, data) {
        switch (data.mode) {
            case 'observer':
                var obs = {socket: socket}
                this.observers[socket.id] = obs;
                break;
            default:
                if (this.observers[socket.id]) {
                    delete this.observers[socket.id];
                }
        }
    }
    , update: function(socket, data) {
        // Send it back to all observers
        for (var i in this.observers) {
            this.observers[i].socket.emit('update', {id: socket.id, data: data});
        }
    }
    , init: function(port) {
        this.app = this.express().use(this.express.static(__dirname))
                .use(this.express.bodyParser())
                .listen(port);
        this.io = this.io.listen(this.app, {log: false});
        this.io.on('connection', function(socket) {
            MMServer.connection(socket);
            socket.on('mode'
                    , function(data) {
                        MMServer.mode(socket, data);
                    }
            );
            socket.on('update'
                    , function(data) {
                        MMServer.update(socket, data);
                    }
            );
            socket.on('disconnect'
                    , function() {
                        MMServer.disconnect(socket);
                    }
            );
        }
        );
    }
};

var port = process.argv[2] || 4242;
console.log("Listening on port " + port);
MMServer.init(port);

