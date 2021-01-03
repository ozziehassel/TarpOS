const { BrowserWindow } = require('electron').remote;
const fs = require('fs');
var sys = {
 processes: [],
 taskbar: ['Files', 'Photos', 'Settings'],
 desktop: [],
 settings: {
     defaultWindowHeight: 30,
     defaultWindowWidth: 30
 }
}
function boot(){
    for(i=0;i<sys.taskbar.length;i++){
        var pinIcon = document.createElement('img');
        pinIcon.style = 'height: 5vh; width: 5vh; margin: 1vh;';
        pinIcon.addEventListener('click', () => {
            openPrgm(sys.taskbar[i]);
        });
        document.getElementById('taskbar').appendChild(pinIcon);
    }
}
function openPrgm(name){
    var window = document.createElement('div');
    window.style.height = sys.settings.defaultWindowHeight + 'vh';
    window.style.width = sys.settings.defaultWindowWidth + 'vw';
    window.style.backgroundColor = 'white';
    window.style.padding = '0';
    window.style.position = 'absolute';
    var close = document.createElement('button');
    close.style = 'outline: 0; border: 1px solid black; position: absolute; top: 0; right: 0; width: 3vw; height: 2.5vh; background: 0;';
    window.appendChild(close);
    close.addEventListener('click', () => {
        closePrgm(name, window);
    })
    sys.processes.push(name);
    document.getElementById('desktop').appendChild(window);
    $(window).draggable({
        containment: "parent"
    });
}
function closePrgm(name, window){
    window.style.display = 'none';
    sys.processes.splice(sys.processes.indexOf(name), 1);
}
boot();