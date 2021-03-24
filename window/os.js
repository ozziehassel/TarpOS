const { BrowserWindow } = require('electron').remote;
const { ipcRenderer } = require('electron');
const fs = require('fs');
const https = require('https');
const admZip = require('adm-zip');
const electron = require('electron');
const userDataPath = (electron.app || electron.remote.app).getPath(
  'userData'
);
if (!fs.existsSync(userDataPath + '/fs')) {
    var zip = new admZip(__dirname.split("window")[0] + "defaultfilesystem.zip");
    zip.extractAllTo(userDataPath);
}
var sys = JSON.parse(fs.readFileSync(userDataPath + "/fs/systemdata.json", "utf8"));
function boot(){
    prgmZindex = 1;
    processId = 0;

    for(i=0;i<sys.taskbar.length;i++){
        var pinIcon = document.createElement('img');
        pinIcon.style = 'height: 5vh; width: 5vh; margin: 1vh;';
        pinIcon.setAttribute('draggable', false);
        pinIcon.setAttribute('onclick', 'openPrgm("'+sys.taskbar[i]+'")');
        pinIcon.src = userDataPath + '/fs/Programs/'+sys.taskbar[i]+'/icon.png';
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
function openPrgm(name, queryobj){
    var window = document.createElement('div');
    window.setAttribute('id', processId);
    window.className = 'win';
    window.style.height = sys.settings.defaultWindowHeight + 'vh';
    window.style.width = sys.settings.defaultWindowWidth + 'vw';
    var close = document.createElement('button');
    window.innerHTML = '<span style="font-weight: bold; padding-left: 6px; line-height: 3vh;">'+name+'</span>';
    close.className = 'closeBtn';
    close.innerHTML = 'X';
    window.appendChild(close);
    close.addEventListener('click',
        new Function('closePrgm(' + processId.toString() + ')')
    );
    var frame = document.createElement('iframe');
    frame.id = name+'_frame';
    frame.style.width = sys.settings.defaultWindowWidth + 'vw';
    frame.style.height = (sys.settings.defaultWindowHeight - 3) + 'vh';
    frame.style.position = 'absolute';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.backgroundColor = "#FFFFFF";
    frame.src = userDataPath + '/fs/Programs/'+name+'/index.html';
    querystring = '?processId=' + processId.toString();

    // queryobj is an optional parameter that passes data into the app on opening via the frame URL's querystring. This way, for example, if you double-click a text file in the files program, you can have it open automatically in the txt program
    if (queryobj) {
        var str = [];
        for (var p in queryobj) {
            if (queryobj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(queryobj[p]));
            }
        }
        querystring += "&" + str.join("&");
    }

    frame.src += querystring;

    window.appendChild(frame);
    window.style.animation = 'fadeZoomIn 150ms';
    document.getElementById('desktop').appendChild(window);
    $(window).draggable({
        containment: "parent"
    });
    
    // move dragged window to front
    prgmZindex++;
    window.style.zIndex = prgmZindex;
    window.addEventListener("mousedown", function() { prgmZindex++; this.style.zIndex = prgmZindex; });

    sys.processes[processId] = {
        name: name
    };
    processId++;
}
function closePrgm(id){
    selected_window = document.getElementById(id);
    closeFXlen = 150;
    selected_window.style.animation = "fadeZoomOut " + closeFXlen.toString() + "ms";
    selected_window.style.opacity = "0"; // so that there's no flash of display after animation plays
    console.log('terminated process ' + id.toString());
    delete sys.processes[id];
    setTimeout(function(win_to_remove) { win_to_remove.remove(); }, closeFXlen, selected_window);
}
function saveFile(name, dir, type, data){
    fs.writeFileSync(userDataPath+'/fs/'+dir+'/'+name+'.'+type, data, (err) => {
        if(err) throw err;
    })
}
window.addEventListener('message', function(event) {
    var command = event.data;
    var appWindow = event.source;
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
                directory_contents = fs.readdirSync(userDataPath+'/fs/'+command.args[0]); // readdirSync allows for better error handling, but it returns data instead of having callback
                appWindow.postMessage(directory_contents);
            } 
            catch(err) { appWindow.postMessage(err.message); }
            break;
        case 'run':
            try {
                if (command.args.length == 1) {
                    openPrgm(command.args[0]);
                    appWindow.postMessage('Success in opening program');
                }
                else if (command.args.length == 2) {
                    // currently queryobj data doesn't work with terminal :( bc terminal only accepts strings
                    openPrgm(command.args[0], command.args[1]);
                }
            } 
            catch(err) { appWindow.postMessage(err.message); }
            break;
        case 'readfile':
            try {
                // file, encoding, flag (ex.: readfile documents/hey.txt utf-8 r)
                file_contents = fs.readFileSync(userDataPath+'/fs/'+command.args[0], {encoding: command.args[1], flag: command.args[2]});
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
            sys.processes = {};
            fs.writeFileSync(userDataPath + '/fs/systemdata.json', JSON.stringify(sys));
            window.postMessage({name: 'requestrestart', args: []});
            break;
        case 'github':
            if (command.args[0] == 'install') {
                try {
                    target_dir = userDataPath + "/fs/Programs/" + command.args[2];
                    online_location = "https://codeload.github.com/" + command.args[1] + "/" + command.args[2] + "/zip/" + command.args[3];
                    local_location = fs.createWriteStream(target_dir + ".zip");
                    request = https.get(online_location, function(response) {
                        stream = response.pipe(local_location);
                        stream.on("finish", () => {
                            var zip = new admZip(target_dir + ".zip"); 
                            zip.extractAllTo(userDataPath + "/fs/Programs/");
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