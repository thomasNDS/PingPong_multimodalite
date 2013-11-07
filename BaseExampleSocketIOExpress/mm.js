var socket = null;
var observations = {}
var valType = 'acceleration';

//_________________________________________________________________________________________________________
//_________________________________________________________________________________________________________
//_________________________________________________________________________________________________________
function init() {
    socket = io.connect();
    socket.on('update', function(data) {
        var obj = observations[data.id];
        if (!obj) {
            // create a dedicated svg canvas
            obj = {};
            obj.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            obj.svg.setAttribute('class', 'logger');
            obj.polyA = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            obj.polyA.setAttribute('class', 'A');
            obj.polyA.setAttribute('points', '');
            obj.svg.appendChild(obj.polyA);
            obj.polyB = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            obj.polyB.setAttribute('class', 'B');
            obj.polyB.setAttribute('points', '');
            obj.svg.appendChild(obj.polyB);
            obj.polyC = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            obj.polyC.setAttribute('class', 'C');
            obj.polyC.setAttribute('points', '');
            obj.svg.appendChild(obj.polyC);
            document.getElementById('loggers').appendChild(obj.svg);
            // Start logging values
            obj.values = [];
            obj.update = updateSVG;
            // Register
            observations[data.id] = obj;
        }
        obj.values.push(data.data);
        obj.update();
    });
    socket.on('disappear', function(data) {
        var obj = observations[data.id];
        if (obj) {
            obj.svg.parentNode.removeChild(obj.svg);
            delete observations[data.id];
        }
    });
    // Buttons
    bt_log = document.getElementById('CmdLog');
    bt_log.addEventListener('click', function() {
        ToggleLogger();
    }, false);
    document.getElementById('CmdObserve').addEventListener('click', function() {
        ToggleObserver();
    }, false);

    // Events
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', deviceMotionHandler, false);
    } else {
        document.body.appendChild(document.createTextNode("No DeviceMotionEvent"));
    }
    if (window.DeviceOrientationEvent) {
        // window.addEventListener('deviceorientation', deviceOrientationHandler, false);
    } else {
        document.body.appendChild(document.createTextNode("No DeviceOrientationEvent"));
    }
}

//_________________________________________________________________________________________________________
function deviceMotionHandler(e) {
    if (bt_log.classList.contains('active')) {
        socket.emit('update', {acceleration: e.acceleration
            , accelerationIncludingGravity: e.accelerationIncludingGravity
            , rotationRate: e.rotationRate});
    }
}

//_________________________________________________________________________________________________________
function updateSVG() {
    // SVG
    var svg = this.svg;
    var svgStyle = window.getComputedStyle(svg);
    var Lg = parseInt(svgStyle.width);
    var Ht = parseInt(svgStyle.height);

    var L = ["", "", ""]
    if (this.values.length > Lg) {
        this.values.splice(0, 1);
    }
    for (var i = 0; i < this.values.length; i++) {
        var j = 0;
        for (jType in this.values[i][valType]) {
            L[j] += i + ',' + (Ht / 2 + Math.round(5 * this.values[i][valType][jType])) + ' ';
            j++;
        }
        /*LA += i+','+(H/2+Math.round(5*this.values[i][valType].x))+' ';
         LB += i+','+(H/2+Math.round(5*this.values[i][valType].y))+' ';
         LC += i+','+(H/2+Math.round(5*this.values[i][valType].z))+' ';*/
    }
    this.polyA.setAttribute('points', L[0]);
    this.polyB.setAttribute('points', L[1]);
    this.polyC.setAttribute('points', L[2]);
}

//_________________________________________________________________________________________________________
function deviceOrientationHandler(e) {
    var txt = /*"<h3>acceleration</h3>" +*/ toString({alpha: e.alpha, beta: e.beta, gamma: e.gamma});
    document.getElementById('orientation').innerHTML = txt;
}

//_________________________________________________________________________________________________________
//_________________________________________________________________________________________________________
//_________________________________________________________________________________________________________
function ToggleObserver() {
    var bt = document.getElementById('CmdObserve');
    bt.classList.toggle('active');
    var mode = '';
    if (bt.classList.contains('active')) {
        mode = 'observer';
        var div = document.createElement('div');
        div.setAttribute('id', 'choiceDisplay');
        var T = ['rotationRate', 'accelerationIncludingGravity', 'acceleration'];
        for (var i in T) {
            var p = document.createElement('p');
            p.innerText = T[i];
            p.setAttribute('class', T[i]);
            p.onclick = function(str) {
                return function() {
                    div.setAttribute('class', str);
                    valType = str;
                };
            }(T[i]);
            div.appendChild(p);
        }
        p.onclick();
        document.getElementById('commands').appendChild(div);
    } else {
        var div = document.getElementById('choiceDisplay');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    socket.emit('mode', {mode: mode});
}

//_________________________________________________________________________________________________________
function ToggleLogger() {
    document.getElementById('CmdLog').classList.toggle('active');
}
