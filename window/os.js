const { BrowserWindow } = require('electron').remote;
const { ipcRenderer } = require('electron');
const fs = require('fs');
const https = require('https');
const admZip = require('adm-zip');
var sys = JSON.parse(fs.readFileSync(__dirname + "/systemdata.json", "utf8"));
function boot(){
    prgmZindex = 1;

    for(i=0;i<sys.taskbar.length;i++){
        var pinIcon = document.createElement('img');
        pinIcon.style = 'height: 5vh; width: 5vh; margin: 1vh;';
        pinIcon.setAttribute('draggable', false);
        pinIcon.setAttribute('onclick', 'openPrgm("'+sys.taskbar[i]+'")');
        pinIcon.src = './fs/Programs/'+sys.taskbar[i]+'/icon.png';
        document.getElementById('taskbar').appendChild(pinIcon);
    }
    document.body.style.fontFamily = sys.globalFont;

    // datetime display
    datetime = document.createElement('div');
    datetime.style.position = 'absolute';
    datetime.style.top = '50%';
    datetime.style.transform = 'translateY(-50%)';
    datetime.style.right = 0;
    datetime.style.paddingRight = '10px';
    document.getElementById('taskbar').appendChild(datetime);
    datetime.style.color = 'white';
    datetime.innerText = (new Date()).toString().split(':').splice(0, 2).join(':');
    setInterval(function() { datetime.innerText = (new Date()).toString().split(':').splice(0, 2).join(':'); }, 2500);
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
    frame.style.position = 'absolute';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.backgroundColor = "#FFFFFF";
    frame.src = './fs/Programs/'+name+'/index.html'
    window.appendChild(frame);
    document.getElementById('desktop').appendChild(window);
    $(window).draggable({
        containment: "parent"
    });
    
    // move dragged window to front
    prgmZindex++;
    window.style.zIndex = prgmZindex;
    window.addEventListener("mousedown", function() { prgmZindex++; this.style.zIndex = prgmZindex; });

    sys.processes.push(name);
}
function closePrgm(name, window){
    window.style.display = 'none';
    sys.processes.splice(sys.processes.indexOf(name), 1);
    console.log(name);
    window.remove();
}
function saveFile(name, dir, type, data){
    fs.writeFileSync(__dirname+'/fs/'+dir+'/'+name+'.'+type, data, (err) => {
        if(err) throw err;
    })
}
window.addEventListener('message', function(event) {
    command = event.data;
    appWindow = event.source;
    switch(command.name) {
        case 'savefile':
            try {
                saveFile(command.args[0], command.args[1], command.args[2], command.args[3]);
                appWindow.postMessage("success in file writing");
            } 
            catch(err) { appWindow.postMessage(err.message); }
            break;
        case 'fetchsystemdata':
            appWindow.postMessage(sys);
            break;
        case 'dir':
            try {
                directory_contents = fs.readdirSync(__dirname+'/fs/'+command.args[0]); // readdirSync allows for better error handling, but it returns data instead of having callback
                appWindow.postMessage(directory_contents);
            } 
            catch(err) { appWindow.postMessage(err.message); }
            break;
        case 'run':
            try {
                openPrgm(command.args[0])
                appWindow.postMessage('Success in opening program');
            } 
            catch(err) { appWindow.postMessage(err.message); }
            break;
        case 'readfile':
            try {
                // file, encoding, flag (ex.: readfile documents/hey.txt utf-8 r)
                file_contents = fs.readFileSync(__dirname+'/fs/'+command.args[0], {encoding: command.args[1], flag: command.args[2]});
                appWindow.postMessage(file_contents);
            }
            catch(err) { appWindow.postMessage(err.message); }
            break;
        case 'requestrestart':
            if (confirm("reboot?")) { // temporary; change to TarpOS style
                ipcRenderer.send("restartos");
            }
            break;
        case 'setsettings':
            sys.settings.defaultWindowWidth = command.args[0];
            sys.settings.defaultWindowHeight = command.args[1];
            sys.globalFont = command.args[2];
            sys.processes = [];
            fs.writeFileSync(__dirname + '/systemdata.json', JSON.stringify(sys));
            window.postMessage({name: 'requestrestart', args: []});
            break;
        case 'github':
            if (command.args[0] == 'install') {
                try {
                    target_dir = __dirname + "/fs/Programs/" + command.args[2];
                    online_location = "https://codeload.github.com/" + command.args[1] + "/" + command.args[2] + "/zip/" + command.args[3];
                    local_location = fs.createWriteStream(target_dir + ".zip");
                    request = https.get(online_location, function(response) {
                        stream = response.pipe(local_location);
                        stream.on("finish", () => {
                            var zip = new admZip(target_dir + ".zip"); 
                            zip.extractAllTo(__dirname + "/fs/Programs/");
                            fs.renameSync(target_dir + "-" + command.args[3], target_dir)
                            appWindow.postMessage("Success in installing program. Use 'run " + command.args[2] + "' to run program.");
                            fs.unlinkSync(target_dir + ".zip");
                        });
                    });
                }
                catch(err) {
                    appWindow.postMessage(err);
                }
            }
            else {
                appWindow.postMessage("no such github command");
            }
            break;
        default:
            appWindow.postMessage("No such command");
            break;
    }
});
boot();