/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!Hammer.HAS_TOUCHEVENTS && !Hammer.HAS_POINTEREVENTS) {
    Hammer.plugins.showTouches();
}

if (!Hammer.HAS_TOUCHEVENTS && !Hammer.HAS_POINTEREVENTS) {
    Hammer.plugins.fakeMultitouch();
}

var hammertime = Hammer(document.getElementById('zoomwrapper1'), {
    transform_always_block: true,
    transform_min_scale: 1,
    drag_block_horizontal: true,
    drag_block_vertical: true,
    drag_min_distance: 0
});

var hammertime2 = Hammer(document.getElementById('zoomwrapper2'), {
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
    elemRect = document.getElementById('zoom1');
    orientation = true;
    manageMultitouch(ev);
    
    console.log(orientation);
});

hammertime2.on('touch drag dragend transform', function(ev) {
    elemRect = document.getElementById('zoom2');
    orientation = false;
    manageMultitouch(ev);
    
    console.log(orientation);
});


function manageMultitouch(ev) {

    switch (ev.type) {
        case 'touch':
            last_scale = scale;
            last_rotation = rotation;

            break;

        case 'drag':
            posX = ev.gesture.deltaX;
            posY = ev.gesture.deltaY;
            if(ev.gesture.deltaX > 0){
                pouic(Math.abs(posX),Math.abs(posY),Math.abs(lastPosX),Math.abs(lastPosY),"svg");
                console.log(posX);
            }
            else{
               
                pouic(lastPosX-document.body.offsetWidth,lastPosY+document.body.offsetHeight,posX-document.body.offsetWidth,posY+document.body.offsetHeight,"svg2");
                console.log(posX);
            }

//            
//            if(orientation===0)
//                pouic(Math.abs(lastPosX),Math.abs(lastPosY),Math.abs(posX),Math.abs(posY));
//            else
//                pouic(Math.abs(lastPosX),Math.abs(lastPosY),Math.abs(posX),Math.abs(posY));
            lastPosX = posX;
            lastPosY = posY;
            break;

        case 'dragend':
            posX = 0;
            posY = 0;
            lastPosX = 0;
            lastPosY = 0;
            svg = document.getElementById("svg");
            while(svg.firstChild){
                svg.removeChild(svg.firstChild);
            }
            break;
    }

    var transform =
            "translate3d(" + posX + "px," + posY + "px, 0) ";

    elemRect.style.transform = transform;
    elemRect.style.oTransform = transform;
    elemRect.style.msTransform = transform;
    elemRect.style.mozTransform = transform;
    elemRect.style.webkitTransform = transform;

}

function pouic(x1,y1,x2,y2,svg)
{
    var svg = document.getElementById(svg);

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'line'); //Create a path in SVG's namespace
    
    newElement.setAttribute("x1", x1); //Set path's data
    newElement.setAttribute("y1", y1); //Set path's data
    newElement.setAttribute("x2", x2); //Set path's data
    newElement.setAttribute("y2", y2); //Set path's data
      
    newElement.style.stroke = "#FF0000"; //Set stroke colour
    newElement.style.strokeWidth = "2px"; //Set stroke width
    svg.appendChild(newElement);
    //('<line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />');
}
