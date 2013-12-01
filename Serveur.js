var pause = false;
var start = false;
var teamArrive = 0;
var Server = {
    fs: require('fs'),
    express: require('express'), // Appel au framework express
    io: require('socket.io'), // Appel au package websocket
    app: null,
    platforms: {},
    observers: {},
    teamOne: {},
    teamTwo: {},
    /**
     * Constructeur du serveur
     * 
     * @param {int} port
     */
    init: function(port) {
        this.app = this.express().use(this.express.static(__dirname))
                .use(this.express.json())
                .listen(port);
        this.io = this.io.listen(this.app, {log: false});
        this.io.on('connection', function(socket) {

            socket.on('mode', function(data) {
                Server.defineMode(socket, data);
            });
            socket.on('pause', function() {
                console.log("pause " + pause);
                pause = !pause;
                for (var i in Server.observers) {
                    Server.observers[i].socket.emit('pause', {mode: pause});
                }
            });
            socket.on('update', function(data) {
                Server.update(socket, data);
            });
            socket.on('ping', function(data) {
                Server.ping(socket, data);
            });
            socket.on('disconnect', function() {
                Server.disconnect(socket);
            });
            socket.on('start', function() {
                for (var i in Server.observers) {
                    Server.observers[i].socket.emit('start', {});
                }
            });
            socket.on('end', function() {
                for (var i in Server.observers) {
                    Server.observers[i].socket.emit('start', {});
                }
            });
        });
    },
    /**
     * Fonction de deconnection d'un client ou d'une plateforme
     * La fonction s'appelle toute seule lors d'une déco
     * 
     * @param {type} socket
     */
    disconnect: function(socket) {
        console.log('disconnect');
        if (this.platforms[socket.id]) {        //Check des plateformes
            delete this.platforms[socket.id];
        }
        if (this.observers[socket.id]) {        //check des observateurs
            delete this.observers[socket.id];
        }
        for (var i in this.observers) {         //notification à tous
            this.observers[i].socket.emit('disappear', {id: socket.id});
        }
    },
    connection: function(socket) {
        console.log('connection');
        var ptf = {socket: socket};
        this.platforms[socket.id] = ptf;
    },
    /**
     * Défini le mode choisit par le device (raquette ou terrain)
     * 
     * @param {socket} socket
     * @param {} data le type de mode
     */
    defineMode: function(socket, data) {
        switch (data.mode) {
            case 'team2':
                console.log('Team2');
                var obs = {socket: socket};
                this.teamTwo[socket.id] = obs;
                this.observers[socket.id] = obs;
                this.updateState(2)
                break;
            case 'team1':
                console.log('Team1');
                var obs = {socket: socket};
                this.teamOne[socket.id] = obs;
                this.observers[socket.id] = obs;
                this.updateState(1);
                break;
            case 'observer':
                console.log('connection observer');
                var obs = {socket: socket};
                this.observers[socket.id] = obs;
                break;
            default:
                if (this.observers[socket.id]) {
                    delete this.observers[socket.id];
                }
        }
    },
    /**
     * Mise à jour des données de l'accéléromètre d'une raquette de ping pong
     * 
     * @param {socket} socket
     * @param {} data données de l'accéléromètre
     */
    update: function(socket, data) {
        // Send it back to all observers
        for (var i in this.observers) {
            this.observers[i].socket.emit('update', {id: socket.id, data: data});
        }
    },
    updateState: function(team) {
        if (teamArrive === 0) {
            teamArrive = team;
        }
        else if (teamArrive !== team) {
            start = true;
            for (var i in this.observers) {
                this.observers[i].socket.emit('beginGame', {});
            }
        }
    },
    ping: function(socket, data) {
        // Send it back to all observers
        //If in zone
        for (var i in this.observers) {
            this.observers[i].socket.emit('playerPing', {id: socket.id, data: data});
        }
    }
};

var port = process.argv[2] || 4242;
console.log("Listening on port " + port + '\n http://localhost:4242/');
Server.init(port);

