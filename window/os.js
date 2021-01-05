const { BrowserWindow } = require('electron').remote;
const fs = require('fs');
var sys = {
 processes: [],
 globalFont: 'arial',
 availFonts: ['arial', 'helvetica', 'verdana', 'courier new', 'garamond'],
 taskbar: ['Files', 'TXT', 'Settings', 'ZOOM'],
 desktop: [],
 settings: {
     defaultWindowHeight: 60,
     defaultWindowWidth: 50
 }
}
function boot(){
    for(i=0;i<sys.taskbar.length;i++){
        var pinIcon = document.createElement('img');
        pinIcon.style = 'height: 5vh; width: 5vh; margin: 1vh;';
        pinIcon.setAttribute('onclick', 'openPrgm("'+sys.taskbar[i]+'")');
        pinIcon.src = './fs/Programs/'+sys.taskbar[i]+'/icon.png';
        document.getElementById('taskbar').appendChild(pinIcon);
    }
    document.body.style.fontFamily = sys.globalFont;
}
function openPrgm(name){
    var window = document.createElement('div');
    window.className = 'win';
    window.style.height = sys.settings.defaultWindowHeight + 'vh';
    window.style.width = sys.settings.defaultWindowWidth + 'vw';
    var close = document.createElement('button');
    window.innerHTML = '<span style="font-weight: bold; padding: 6px;">'+name+'</span>';
    window.style.backgroundColor = "#EEEEEE";
    close.className = 'closeBtn';
    close.innerHTML = 'X';
    window.appendChild(close);
    close.addEventListener('click', () => {
        closePrgm(name, window);
    });
    var frame = document.createElement('iframe');
    frame.id = name+'_frame';
    frame.style.width = sys.settings.defaultWindowWidth + 'vw';
    frame.style.height = (sys.settings.defaultWindowHeight - 3) + 'vh';
    frame.style.marginTop = '6px';
    frame.style.backgroundColor = "#FFFFFF";
    frame.src = './fs/Programs/'+name+'/index.html'
    window.appendChild(frame);
    document.getElementById('desktop').appendChild(window);
    $(window).draggable({
        containment: "parent"
    });
    sys.processes.push(name);
}
function closePrgm(name, window){
    window.style.display = 'none';
    sys.processes.splice(sys.processes.indexOf(name), 1);
    console.log(name);
    window.remove(); // stops running processes; will reduce lag
}
function saveFile(name, dir, type, data){
    fs.writeFile('.fs/'+dir+'/'+name+'.'+type, data, (err) => {
        if(err) throw err;
    })
}
boot();