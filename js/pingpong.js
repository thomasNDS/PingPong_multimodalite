var socket = null;
var observations = {}
var valType = 'acceleration';
var dexterity = "right";
var dateLastAction = new Date();
var mode = "observer";
var connected = false;
var pause = false;
/**
 * Constructeur de l'app client
 */
function init() {
    window.document.title = "e-Pong"
    $('#options').hide();
    console.log("init");
    socket = io.connect();
    socket.on('update', function(data) {
        var actualDate = new Date();
        var diffSinceLastAction = actualDate.getTime() - dateLastAction.getTime();
        if (data.data.accelerationIncludingGravity.z > 15 && diffSinceLastAction > 1000) {
            var coup;
            if (dexterity == "left") {
                coup = "simpleDroit";
                if (data.data.rotationRate.beta > 0) {
                    coup = "simpleRevert";
                }
            } else {
                coup = "simpleRevert";
                if (data.data.rotationRate.beta > 0) {
                    coup = "simpleDroit";
                }
            }
            dateLastAction = actualDate;
            ping(data.data.accelerationIncludingGravity.z, coup);
        }
    });
    //Ajout des listener de messages
    socket.on('disappear', function(data) {
        var obj = observations[data.id];
        if (obj) {
            obj.svg.parentNode.removeChild(obj.svg);
            delete observations[data.id];
        }
    });
    $('#startGame').hide();
    socket.on('beginGame', function() {
        console.log('start beginGame');
        $('#waitingPlayers').hide();
        $('#startGame').show();
        $('#titleEpong').hide();
    });


    socket.on('playerPing', function(data) {
        $("#info").html("Type: " + data.data.type + " puissance: " + data.data.power + " team: " + data.data.mode);
        
        if (data.data.mode === "team1") {
            hitTheBall(data.data.power, data.data.type, 1);
        } else if (data.data.mode === "team2") {
            hitTheBall(data.data.power, data.data.type, 0);
        }
    });

    socket.on('pause', function(data) {
        if (data.mode) {
            console.log("pause on");
            pause = true;
            $('.pause_menu_open').click();
            pauseGame();
        } else {
            pause = false;
            console.log("pause off");
            $('.pause_menu_close').click();
            unpauseGame();
        }
    });

    // Ajout de listener de bouttons
    $('#pause').on('click', function() {
        console.log("pause");
        socket.emit('pause', {});
    });

    $('#terrain').on('click', function() {
        console.log("click terrain");
        //mode = "observer";
        $('#terrain').addClass('active');
        $('#joueur1').removeClass('active');
        $('#joueur2').removeClass('active');
        $('#options').hide();
        subscribe2Server();
    });

    $('#gaucher').on('click', function() {
        dexterity = "left";
        $('#gaucher').addClass('active');
        $('#droitier').removeClass('active');
    });
    $('#droitier').on('click', function() {
        dexterity = "right";
        $('#droitier').addClass('active');
        $('#gaucher').removeClass('active');
    });
    $('#joueur1').on('click', function() {
        console.log("click j1");
        mode = "team1";
        connected = true;
        $('#joueur1').addClass('active');
        $('#joueur2').removeClass('active');
        $('#terrain').removeClass('active');
        $('#options').show();
        subscribe2Server();
        pauses(true);
    });
    $('#joueur2').on('click', function() {
        console.log("click j2");
        mode = "team2";
        connected = true;
        $('#joueur2').addClass('active');
        $('#joueur1').removeClass('active');
        $('#terrain').removeClass('active');
        $('#options').show();
        subscribe2Server();
        pauses(true);
    });

    // Events
    if (window.DeviceMotionEvent) { //Si accéléromètre
        window.addEventListener('devicemotion', deviceMotionHandler, false);
        console.log("raquette");
    } else {
        console.log("terrain");
        //On masque les boutons relatif aux raquettes
        $('#info').text(" cet appareil ne dispose pas d'accéléromètre");
        $('#joueur1').hide();
        $('#joueur2').hide();
        $('#register').hide();
    }

    $('#goGame').attr("disabled", "disabled");

}
function endGame() {
    $('#goGame').attr("disabled", "disabled");
    $('#waitingPlayers').show();
    $('#startGame').hide();
    $('#titleEpong').show();
}

function pauses(state) {
    if (state != pause)
        socket.emit('pause', {});
}
/**
 * Frappe la balle et j'en informe le serveur
 * @param {type} puissance
 * @returns {undefined}
 */
function ping(puissance, typeOfHit) {
    socket.emit('ping', {power: puissance, type: typeOfHit, mode: mode});
}

/**
 * Send dataperiodically to the server
 * @param {type} e: event
 */
function deviceMotionHandler(e) {
    if (connected == true) {
        socket.emit('update', {acceleration: e.acceleration,
            accelerationIncludingGravity: e.accelerationIncludingGravity,
            rotationRate: e.rotationRate});
    }
}

///**
// * Affiche le menu observateur
// */
function subscribe2Server() {
    socket.emit('mode', {mode: mode});
}