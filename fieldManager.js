// Global variables

//Terrain
var field = document.getElementById('field');
var fieldStyle = window.getComputedStyle(field);
var fieldHeight = parseInt(fieldStyle.height);
var fieldWidth = parseInt(fieldStyle.width);
var largeurAcceptableHit = 250;

//Balle
var ballRayon = 15;
var ballColor = "white";
var ballDX = fieldWidth / 150; // Change in ball x position.
var ballDY = fieldHeight / 150; // Change in ball y position.
var ballDYBase = ballDY;
var ballFirstPosX = 0;
var ballFirstPosY = 20;
var ballX = ballFirstPosX; // Ball x position.
var ballY = ballFirstPosY; // Ball y position.
//var paddleX = 150; // Initial paddle location.
//var paddleH = 10; // Paddle height.
//var paddleD = fieldHeight - paddleH; // Paddle depth.
//var paddleW = 150; // Paddle width.

//Jeu
var isHitable = false;
var isRuning = false;
var coefPuissance = 1;
var gameLoop = null;
var playerPlaying = 1; // 0 joueur gauche 1 droite
var lastPlayerPlaying;
var team1point = 0;
var team2point = 0;
var pointForGame = 5;

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
    if (ballX + ballDX > fieldWidth - largeurAcceptableHit || ballX + ballDX < largeurAcceptableHit) {
        isHitable = true;
        console.log("TAPE!!");
        if (ballX + ballDX > fieldWidth + ballRayon || ballX + ballDX < -ballRayon) {
            endGame();
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
    if (gameLoop) { //si y'a déjà un setInterval en cours, on le supprime avant de le recréér
        clearInterval(gameLoop);
        gameLoop = null;
    }
    gameLoop = setInterval(drawBall, 16);
}

function endGame() {
    resetGame();
    // Si victoire avec 2 point d'ecart
    if (Math.abs(team1point - team2point) > 2 && ((team1point > pointForGame) || (team1point > pointForGame))) {
        $('#pause').hide();
        isRuning = false;
        window.clearInterval(gameLoop);
        gameLoop = null;
        $('#titleEpong').show();
        // On réinitialise les scores
        team1point = 0;
        team2point = 0;
    }
    $('#scoreTeam1').html(team1point);
    $('#scoreTeam2').html(team2point);
}

function resetGame() {
    ballX = ballFirstPosX;
    ballY = ballFirstPosY;
    ball.setAttribute("cx", ballX);
    ball.setAttribute("cy", ballY);
    ballDX = fieldWidth / 150;
    ballDY = fieldHeight / 150;
    coefPuissance = 1;
    playerPlaying = 1;
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
    if (isHitable & (playerPlaying === teamToPlay)) {
        console.log("joueur qui doit jouer : " + playerPlaying + " type de coup : " + type + " team recu : " + teamToPlay);
        ballDX = -ballDX;
        ballDY = ballDYBase * calculNextY();
        coefPuissance = 0.85 + (puissance / 100);
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

/*
 * Renvoie une valeus correspondant au coefficient à appliquer au Y de la balle après un coup
 * @returns {Number|largeurAcceptableHit|ballX|fieldWidth}
 */
function calculNextY() {
    var posXinZoneHit;
    //Calcul de l'endroit ou la frappe a eu lieu en fonction de si c'est a gauche ou a droite
    //A gauche
    if (playerPlaying === 0) {
        posXinZoneHit = (largeurAcceptableHit - (ballX + ballRayon)) / largeurAcceptableHit;
    } else {
        // A droite
        var beginXZone = fieldWidth - largeurAcceptableHit;
        posXinZoneHit = ((ballX + ballRayon) - beginXZone) / largeurAcceptableHit;
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
    document.getElementById("leftHitableZone").setAttribute("width", largeurAcceptableHit);
    document.getElementById("leftHitableZone").setAttribute("height", "100%");
    document.getElementById("leftHitableZone").setAttribute("fill", "grey");
}

/*
 *  Fonction pour donner les informations sur la zone droite à partir de laquelle on peut taper
 */
function writeRightHitableZone() {
    var xZone = document.getElementById("field").offsetWidth - largeurAcceptableHit;
    document.getElementById("rightHitableZone").setAttribute("x", xZone);
    document.getElementById("rightHitableZone").setAttribute("y", "1");
    document.getElementById("rightHitableZone").setAttribute("width", largeurAcceptableHit);
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