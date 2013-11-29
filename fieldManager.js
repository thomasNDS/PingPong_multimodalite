// Global variables
var field = document.getElementById('field');
var fieldStyle = window.getComputedStyle(field);
var fieldHeight = parseInt(fieldStyle.height);
var fieldWidth = parseInt(fieldStyle.width);
var ballX = 150; // Ball x position.
var ballY = 150; // Ball y position.
var ballDX = fieldWidth / 150; // Change in ball x position.
var ballDY = fieldHeight / 150; // Change in ball y position.
var ballDYBase = ballDY;
//var paddleX = 150; // Initial paddle location.
//var paddleH = 10; // Paddle height.
//var paddleD = fieldHeight - paddleH; // Paddle depth.
//var paddleW = 150; // Paddle width.
var isHitable = false;
var isRuning = false;
var largeurAcceptableHit = 150;
var coefPuissance = 1;
var gameLoop = null;
var playerPlaying = 1; // 0 joueur gauche 1 droite
var lastPlayerPlaying;

function drawGameSVG() {
    // Add keyboard listener.
    window.addEventListener('keydown', whatKey, true);
    window.addEventListener('resize', updateField, true);
    updateField();
}

/*
 * Dessine la balle
 * Le '15' fait référence à la taille de la balle dans le html
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
        if (ballX + ballDX > fieldWidth + 15 || ballX + ballDX < -15) {
            endGame();
        }
    }
    else {
        isHitable = false;
    }

    // If ball hits the top, bounce it. 
    if (ballY + ballDY < 15 || ballY + ballDY > fieldHeight - 15)
        ballDY = -ballDY;
}

function beginGame() {
    isRuning = true;
    resetGame();
    if (gameLoop) { //si y'a déjà un setInterval en cours, on le supprime avant de le recréér
        clearInterval(gameLoop);
        gameLoop = null;
    }
    gameLoop = setInterval(drawBall, 16);
}

function endGame() {
    isRuning = false;
    window.clearInterval(gameLoop);
    gameLoop = null;

    var reset = confirm("Recommencer?");
    if (reset){
        resetGame();
        beginGame();
    }

}

function resetGame() {
    ballX = 150;
    ballY = 150;
    ball.setAttribute("cx", ballX);
    ball.setAttribute("cy", ballY);
    ballDX = fieldWidth / 150;
    ballDY = fieldHeight / 150;
    coefPuissance = 1;
    playerPlaying = 1;
}

function hitTestDroit() {
    hitTheBall(1, "simpleDroit");
}

function hitTestGauche() {
    hitTheBall(1, "simpleRevert");
}

function hitTheBall(puissance, type) {
    if (isHitable) {
        ballDX = -ballDX;
        ballDY = ballDYBase * calculNextY();
        coefPuissance = puissance;
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
 * 15 pour la largeur de balle encore une fois
 * @returns {Number|largeurAcceptableHit|ballX|fieldWidth}
 */
function calculNextY() {
    var posXinZoneHit;
    //Calcul de l'endroit ou la frappe a eu lieu en fonction de si c'est a gauche ou a droite
    //A gauche
    if (playerPlaying === 0) {
        posXinZoneHit = (largeurAcceptableHit - (ballX + 15)) / largeurAcceptableHit;
    } else {
        // A droite
        var beginXZone = fieldWidth - largeurAcceptableHit;
        posXinZoneHit = ((ballX + 15) - beginXZone) / largeurAcceptableHit;
    }

    console.log(posXinZoneHit);
    var coef = 0;
    if (checkHandToHit() === "right") {
        //Coup droit
        coef = 1 - 2 * posXinZoneHit;
    } else {
        //Revert
        coef = -(1 - 2 * posXinZoneHit);
    }

    if (playerPlaying === 0) {
        //On multiplie par la direction de la balle pour avoir le bon sens.
        coef = coef * getDirectionBall();
    }

    console.log("coef = " + coef);
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

function updateField() {
    console.log("resize");
    writeLeftHitableZone();
    writeRightHitableZone();
    fieldWidth = document.getElementById("field").offsetWidth;
    fieldHeight = document.getElementById("field").offsetHeight;
}