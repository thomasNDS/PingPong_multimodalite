// Global variables

//Terrain
var field = document.getElementById('field');
var fieldStyle = window.getComputedStyle(field);
var fieldHeight = parseInt(fieldStyle.height);
var fieldWidth = parseInt(fieldStyle.width);
var largeurAcceptableHit = 25; //0; En pourcentage

//Balle
var ballRayon = 15;
var ballColor = "white";
var ballDX = 0; // Change in ball x position.
var ballDY = 0; // Change in ball y position.
var ballDYBase = ballDY;
var ballX = 0; // Ball x position.
var ballY = 0; // Ball y position.
//var paddleX = 150; // Initial paddle location.
//var paddleH = 10; // Paddle height.
//var paddleD = fieldHeight - paddleH; // Paddle depth.
//var paddleW = 150; // Paddle width.

//Jeu
var isHitable = false;
var isRuning = false;
var coefPuissance = 1;
var gameLoop = null;
var playerPlaying; // 0 joueur gauche 1 droite
var lastPlayerPlaying;
var team1point = 0;
var team2point = 0;
var pointForGame = 5;
var waitService = false;
var teamWhoHaveService = 0;

function drawGameSVG() {
    // Add keyboard listener.
    window.addEventListener('keydown', whatKey, true);
    window.addEventListener('resize', updateField, true);
    updateField();
    writeBall();
}

/*
 * Dessine la balle
 */
function drawBall() {

    if (!isRuning) {
        return;
    }

    // Change the ball location.
    ballX += ballDX * coefPuissance;
    ballY += ballDY * coefPuissance;
    ball.setAttribute("cx", ballX);
    ball.setAttribute("cy", ballY);
    var largAccep = (document.getElementById("field").offsetWidth * largeurAcceptableHit) / 100;
    if (ballX + ballDX > fieldWidth - largAccep || ballX + ballDX < largAccep) {
        isHitable = true;
        console.log("TAPE!!");
        if (ballX + ballDX > fieldWidth + ballRayon) {
            endGame(1);
        }
        if (ballX + ballDX < -ballRayon) {
            endGame(2);
        }
    }
    else {
        isHitable = false;
    }

    // If ball hits the top, bounce it. 
    if (ballY + ballDY < ballRayon || ballY + ballDY > fieldHeight - ballRayon) {
        ballDY = -ballDY;
//        endGame();
    }
}

function beginGame() {
    $('#pause').show();
    $('#titleEpong').hide();
    $('#ChooseMode').hide();
    isRuning = true;
    resetGame();
    waitService = true;
    $('#infoDetails').html('<h1> Service équipe ' + ((teamWhoHaveService + 1)) + ' </h1>');
}

function service(team) {
    console.log("team " + team + " who have service=" + teamWhoHaveService);
    if (team === teamWhoHaveService) {
        if (gameLoop) { //si y'a déjà un setInterval en cours, on le supprime avant de le recréér
            clearInterval(gameLoop);
            gameLoop = null;
        }
        gameLoop = setInterval(drawBall, 16);
        //On attend plus de service suivant
        waitService = false;
        $('#infoDetails').html('');
        //on change l'équpe qui a le service
        if (teamWhoHaveService === 0)
            teamWhoHaveService = 1;
        else {
            teamWhoHaveService = 0;
        }
    }
}

function endGame(team) {
    waitService = true;
    window.clearInterval(gameLoop);
    gameLoop = null;

    // Si victoire avec 2 point d'ecart
    if (Math.abs(team1point - team2point) > 2 && ((team1point > pointForGame) || (team2point > pointForGame))) {
        $('#pause').hide();
        isRuning = false;
//        window.clearInterval(gameLoop);
//        gameLoop = null;
        $('#titleEpong').show();
        // On réinitialise les scores
        team1point = 0;
        team2point = 0;
    } else {
        if (team === 1) {
            team1point++;
        } else {
            team2point++;
        }
    }
    resetGame();
    $('#infoDetails').html('<h1> Service équipe ' + ((teamWhoHaveService + 1)) + ' </h1>');
    $('#scoreTeam1').html(team1point);
    $('#scoreTeam2').html(team2point);
}

function resetGame() {
     
    ball.setAttribute("cx", ballX);
    ball.setAttribute("cy", ballY);
    coefPuissance = 1;

    //On fixe la balle du bon coté du terrain
    if (teamWhoHaveService === 0) {
        console.log("team1 a le service");
        ballX = 0;
        ballY = fieldHeight / 2 - 5;
        ballDX = fieldWidth / 150;
        ballDY = fieldHeight / 150;
        playerPlaying = 0;
    } else {
        console.log("team2 a le service");
        ballX = fieldWidth;
        ballY = fieldHeight / 2 - 5;
        ballDX = -fieldWidth / 150;
        ballDY = -fieldHeight / 150;
        playerPlaying = 1;
    }
    console.log("========================service=" + teamWhoHaveService + "=====================")
}

function pauseGame() {
    isRuning = false;
}

function unpauseGame() {
    isRuning = true;
}

function hitTestDroit() {
    hitTheBall(15, "simpleDroit", playerPlaying);
}

function hitTestGauche() {
    hitTheBall(15, "simpleRevert", playerPlaying);
}

function hitTheBall(puissance, type, teamToPlay) {
    console.log("hit" + teamToPlay)
    if (waitService) {
        service(teamToPlay);
    } else {
        if (isHitable && (playerPlaying === teamToPlay) && isItToMyTeamToPlay(teamToPlay)) {
            console.log("joueur qui doit jouer : " + playerPlaying + " team reçu : " + teamToPlay);
            ballDX = -ballDX;
            ballDY = ballDYBase * calculNextY();
            coefPuissance = 0.85 + puissance / 100;
            playerPlaying = (playerPlaying + 1) % 2;
            switch (type) {
                case 'simpleDroit':
                    break;
                case 'simpleRevert':
                    break;
                default:
                    break;
            }
        }
    }
}

/*
 * Renvoie une valeus correspondant au coefficient à appliquer au Y de la balle après un coup
 * @returns {Number|largeurAcceptableHit|ballX|fieldWidth}
 */
function calculNextY() {
    var posXinZoneHit;
    var largAccep = (document.getElementById("field").offsetWidth * largeurAcceptableHit) / 100;
    //Calcul de l'endroit ou la frappe a eu lieu en fonction de si c'est a gauche ou a droite
    //A gauche
    if (playerPlaying === 0) {
        posXinZoneHit = (largAccep - (ballX + ballRayon)) / largAccep;
    } else {
        // A droite
        var beginXZone = fieldWidth - largAccep;
        posXinZoneHit = ((ballX + ballRayon) - beginXZone) / largAccep;
    }

//    console.log(posXinZoneHit);
    var coef = 0;
    //Selon le coup réalisé, calcul différent
    if (checkHandToHit() === "right") {
        //Coup droit
        coef = 1 - 2 * posXinZoneHit;
    } else {
        //Revert
        coef = -(1 - 2 * posXinZoneHit);
    }

    if (playerPlaying === 0) {
        //Cas batard du gars a gauche de la table .. On multiplie par la direction de la balle pour avoir le bon sens.
        coef = coef * getDirectionBall();
    }
    return coef;
}

/*
 * 
 * @param {type} team
 * @returns {undefined}
 */
function isItToMyTeamToPlay(team) {
    var fieldWidth = document.getElementById("field").offsetWidth;
    if (team === 1 && (ballX > (fieldWidth / 2))) {
        //Equipe de droite
        return true;
    } else if (team === 0 && (ballX < (fieldWidth / 2))) {
        //Equipe de gauche
        return true;
    }
    return false;
}

/*
 * Fonction pour savoir la direction de la balle
 * 1 pour haut en bas
 * -1 pour bas en haut
 * @returns {Number}
 */
function getDirectionBall() {
    var direction = 0;
    if ((ballY - ballDY) < ballY) {
        direction = 1;
    } else {
        direction = -1;
    }
    return direction;
}

function checkHandToHit(mainHand) {
    var hand = null;
    if (ballX < fieldWidth / 2) {
        if (ballY <= fieldHeight / 2) {
            hand = "revert";
        } else {
            hand = "right";
        }
    } else {
        if (ballY <= fieldHeight / 2) {
            hand = "right";
        } else {
            hand = "revert";
        }
    }
    return hand;
}

// Get key press.
function whatKey(evt) {
    switch (evt.keyCode) {
        // Left arrow.
        case 37:
            if (checkHandToHit() === "revert") {
                hitTestGauche();
            }
            break;
            // Right arrow.
        case 39:
            if (checkHandToHit() === "right") {
                hitTestDroit();
            }
            break;
    }
}

/*
 * Fonction pour donner les informations sur la zone gauhe à partir de laquelle on peut taper
 */
function writeLeftHitableZone() {
    document.getElementById("leftHitableZone").setAttribute("x", "1");
    document.getElementById("leftHitableZone").setAttribute("y", "1");
    document.getElementById("leftHitableZone").setAttribute("width", largeurAcceptableHit + "%");
    document.getElementById("leftHitableZone").setAttribute("height", "100%");
    document.getElementById("leftHitableZone").setAttribute("fill", "grey");
}

/*
 *  Fonction pour donner les informations sur la zone droite à partir de laquelle on peut taper
 */
function writeRightHitableZone() {
    var largAccep = (document.getElementById("field").offsetWidth * largeurAcceptableHit) / 100;
    var xZone = document.getElementById("field").offsetWidth - largAccep;
    document.getElementById("rightHitableZone").setAttribute("x", xZone);
    document.getElementById("rightHitableZone").setAttribute("y", "1");
    document.getElementById("rightHitableZone").setAttribute("width", largeurAcceptableHit + "%");
    document.getElementById("rightHitableZone").setAttribute("height", "100%");
    document.getElementById("rightHitableZone").setAttribute("fill", "grey");
}

/*
 * Fonction pour donner les infos de la ball
 */
function writeBall() {
    document.getElementById("ball").setAttribute("cx", ballX);
    document.getElementById("ball").setAttribute("cy", ballY);
    document.getElementById("ball").setAttribute("r", ballRayon);
    document.getElementById("ball").setAttribute("fill", ballColor);
}

function updateField() {
    console.log("resize");
    writeLeftHitableZone();
    writeRightHitableZone();
    fieldWidth = document.getElementById("field").offsetWidth;
    fieldHeight = document.getElementById("field").offsetHeight;
}