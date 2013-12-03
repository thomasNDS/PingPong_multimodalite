/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var position = "";
var childs = new Array();

var firstPosX = null;
var firstPosY = null;

if (!Hammer.HAS_TOUCHEVENTS && !Hammer.HAS_POINTEREVENTS) {
    Hammer.plugins.showTouches();
}

if (!Hammer.HAS_TOUCHEVENTS && !Hammer.HAS_POINTEREVENTS) {
    Hammer.plugins.fakeMultitouch();
}

var hammertime = Hammer(document.getElementById('zoom1'), {
    transform_always_block: true,
    transform_min_scale: 1,
    drag_block_horizontal: true,
    drag_block_vertical: true,
    drag_min_distance: 0
});

var hammertime2 = Hammer(document.getElementById('zoom2'), {
    transform_always_block: true,
    transform_min_scale: 1,
    drag_block_horizontal: true,
    drag_block_vertical: true,
    drag_min_distance: 0
});

var hammertime3 = Hammer(document.getElementById('zoom3'), {
    transform_always_block: true,
    transform_min_scale: 1,
    drag_block_horizontal: true,
    drag_block_vertical: true,
    drag_min_distance: 0
});

var hammertime4 = Hammer(document.getElementById('zoom4'), {
    transform_always_block: true,
    transform_min_scale: 1,
    drag_block_horizontal: true,
    drag_block_vertical: true,
    drag_min_distance: 0
});

var posX = 0, posY = 0,
        lastPosX = 0, lastPosY = 0,
        bufferX = 0, bufferY = 0,
        scale = 1, last_scale,
        rotation = 1, last_rotation, dragReady = 0;

hammertime.on('touch drag dragend transform', function(ev) {
    orientation = true;
    manageMultitouch(ev);
    position = "hautgauche";
});

hammertime2.on('touch drag dragend transform', function(ev) {
    orientation = false;
    manageMultitouch(ev);
    position = "basdroite";
});

hammertime3.on('touch drag dragend transform', function(ev) {
    orientation = true;
    manageMultitouch(ev);
    position = "basgauche";
});

hammertime4.on('touch drag dragend transform', function(ev) {
    orientation = false;
    manageMultitouch(ev);
    position = "hautdroite";
});


function manageMultitouch(ev) {

    switch (ev.type) {
        case 'drag':
            var touches = ev.gesture.touches;
            posX = touches[0].pageX;
            posY = touches[0].pageY;
            if(lastPosX!==0 && lastPosY!==0)
                draw(posX,posY,lastPosX,lastPosY);
            if (firstPosX === null && firstPosY === null)
            {
                firstPosX = posX;
                firstPosY = posY;
            }
            lastPosX = posX;
            lastPosY = posY;
            break;

        case 'dragend':
            console.log(position);
            var norme = Math.sqrt((lastPosX - firstPosX) * (lastPosX - firstPosX) + (lastPosY - firstPosY) * (lastPosY - firstPosY));
            var superPuissance = norme / (fieldWidth / 2) * 60;
            if (superPuissance > 10 ) {
                if (position === "hautdroite" && joueurP2tactile)
                    tactilePing(superPuissance, "simpleDroit", "team2");
                if (position === "basdroite" && joueurP2tactile)
                    tactilePing(superPuissance, "simpleRevert", "team2");
                if (position === "basgauche" && joueurP1tactile)
                    tactilePing(superPuissance, "simpleDroit", "team1");
                if (position === "hautgauche" && joueurP1tactile)
                    tactilePing(superPuissance, "simpleRevert", "team1");
            }
            console.log(superPuissance);
            

            svg = document.getElementById("field");
            var k=0;
            var lenght = childs.length;
            while(k<lenght){
                svg.removeChild(childs[k]);
                k++;
            }
            
            childs = new Array();
            posX = 0;
            posY = 0;
            lastPosX = 0;
            lastPosY = 0;
            firstPosX = null;
            firstPosY = null;
                
            break;
    }
}

function draw(x1,y1,x2,y2)
{
    var svg = document.getElementById("field");

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'line'); //Create a path in SVG's namespace

    newElement.setAttribute("x1", x1); //Set path's data
    newElement.setAttribute("y1", y1); //Set path's data
    newElement.setAttribute("x2", x2); //Set path's data
    newElement.setAttribute("y2", y2); //Set path's data

    newElement.style.stroke = "#FF0000"; //Set stroke colour
    newElement.style.strokeWidth = "2px"; //Set stroke width
    var child = svg.appendChild(newElement);
    childs.push(child);
    
}
