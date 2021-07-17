const { app, ipcRenderer, remote } = require('electron');
const { BrowserWindow, Menu } = remote;
const fs = require('fs');
const https = require('https');
const admZip = require('adm-zip');
const userDataPath = (app || remote.app).getPath('documents');

// if there is not already an TarpOS_files directory in the user data path, make one, using defaultfilesystem as a template
if (!fs.existsSync(userDataPath + '/TarpOS_files')) {
    fs.mkdirSync(userDataPath + '/TarpOS_files');
    fs.writeFileSync(userDataPath + '/TarpOS_files/systemdata.json', JSON.stringify(
        {"processes":{},"globalFont":"verdana","availFonts":["arial","helvetica","verdana","courier new","garamond"],"taskbar":["Files","TXT","Settings","Terminal","ZOOM"],"desktop":[],"settings":{"defaultWindowHeight":60,"defaultWindowWidth":50}}
    ));
    var zip = new admZip();
    zip.addLocalFolder(__dirname.split("window")[0] + "defaultfilesystem");
    zip.extractAllTo(userDataPath + '/TarpOS_files/fs');
}

var sys = JSON.parse(fs.readFileSync(userDataPath + "/TarpOS_files/systemdata.json", "utf8"));
var prgmZindex;
var processId;
function boot(){
    prgmZindex = 1;
    processId = 0;

    for(i=0;i<sys.taskbar.length;i++){
        var pinIcon = document.createElement('img');
        pinIcon.style = 'height: 5vh; width: 5vh; margin: 1vh;';
        pinIcon.setAttribute('draggable', false);
        pinIcon.setAttribute('onclick', 'openPrgm("'+sys.taskbar[i]+'")');
        pinIcon.src = userDataPath + '/TarpOS_files/fs/Programs/'+sys.taskbar[i]+'/icon.png';
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
    window.style.display = 'flex';
    window.style.flexFlow = 'column';
    var titleBar = document.createElement('div');
    titleBar.style.width = '100%';
    titleBar.style.height = '3vh';
    titleBar.style.minHeight = '3vh'; // prevent shrinking when window really small
    window.appendChild(titleBar);
    var close = document.createElement('button');
    titleBar.innerHTML = '<span style="font-weight: bold; padding-left: 6px; line-height: 3vh;">'+name+'</span>';
    close.className = 'closeBtn';
    close.innerHTML = 'X';
    titleBar.appendChild(close);
    close.addEventListener('click',
        new Function('closePrgm(' + processId.toString() + ')')
    );
    var fullScreen = document.createElement('button');
    fullScreen.className = 'fullscreenBtn';
    fullScreen.innerText = '□';
    titleBar.appendChild(fullScreen);
    fullScreen.addEventListener('click',
        new Function(`
        if (document.getElementById("` + processId.toString() + `").style.width == "100vw") {
            document.getElementById("` + processId.toString() + `").style.width = sys.settings.defaultWindowWidth + 'vw';
            document.getElementById("` + processId.toString() + `").style.height = sys.settings.defaultWindowHeight + 'vh';
        }
        else {
            document.getElementById("` + processId.toString() + `").style.top = "0";
            document.getElementById("` + processId.toString() + `").style.left = "0";
            document.getElementById("` + processId.toString() + `").style.width = "100vw";
            document.getElementById("` + processId.toString() + `").style.height = "93vh";
        }
        `)
    );
    var frame = document.createElement('iframe');
    frame.id = name+'_frame';
    frame.style.width = '100%';
    frame.style.minHeight = '0';
    frame.style.flex = '1 1 auto';
    frame.style.backgroundColor = "#FFFFFF";
    frame.src = userDataPath + '/TarpOS_files/fs/Programs/'+name+'/index.html';
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
        containment: "parent",
        start() {
            $(".win").each(function (index, element) {
                var d = $(`<div class="iframeCover" style="zindex:${prgmZindex + 10};position:absolute;width:100%;top:0px;left:0px;height:${$(element).height()}px"></div>`);
                $(element).append(d);
            });
        },
        stop() {
            $('.iframeCover').remove();
        }
    });
    $(window).resizable({
        containment: "parent",
        handles: 'nw, ne, sw, se, n, e, s, w',
        start() {
            $('iframe').css('pointer-events', 'none');
        },
        stop: function(event, ui) {
            $('iframe').css('pointer-events', 'auto');
        },
    });
    window.style.position = "absolute";

    $("ui-resizable-handle").mousedown(function() {
        $('iframe').css('pointer-events', 'auto');
    });
    $("ui-resizable-handle").mouseup(function() {
        $('iframe').css('pointer-events', 'auto');
    });
    
    // add preload script to the head of the iframe document
    var frameDoc = frame.contentDocument;
    var preload = frameDoc.createElement("script");
    preload.append(fs.readFileSync(__dirname + "/global_app_preload.js", "utf-8"));
    frameDoc.head.appendChild(preload);
    
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
    fs.writeFileSync(userDataPath+'/TarpOS_files/fs/'+dir+'/'+name+'.'+type, data, (err) => {
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
                directory_contents = fs.readdirSync(userDataPath+'/TarpOS_files/fs/'+command.args[0]); // readdirSync allows for better error handling, but it returns data instead of having callback
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
                file_contents = fs.readFileSync(userDataPath+'/TarpOS_files/fs/'+command.args[0], {encoding: command.args[1], flag: command.args[2]});
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
            document.body.style.fontFamily = sys.globalFont;
            var sys_clone = JSON.parse(JSON.stringify(sys));
            sys_clone.processes = {};
            fs.writeFileSync(userDataPath + '/TarpOS_files/systemdata.json', JSON.stringify(sys_clone));
            break;
        case 'github':
            if (command.args[0] == 'install') {
                try {
                    target_dir = userDataPath + "/TarpOS_files/fs/Programs/" + command.args[2];
                    online_location = "https://codeload.github.com/" + command.args[1] + "/" + command.args[2] + "/zip/" + command.args[3];
                    local_location = fs.createWriteStream(target_dir + ".zip");
                    request = https.get(online_location, function(response) {
                        stream = response.pipe(local_location);
                        stream.on("finish", () => {
                            var zip = new admZip(target_dir + ".zip"); 
                            zip.extractAllTo(userDataPath + "/TarpOS_files/fs/Programs/");
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
// REGISTER KEYBOARD SHORTCUTS
Menu.setApplicationMenu(Menu.buildFromTemplate([{
    label: "Keyboard Shortcuts",
    submenu: [
        { role: "copy" },
        { role: "paste" },
        { role: "cut" },
        { role: "pasteAndMatchStyle" },
        { role: "selectAll" },
        { role: "undo" },
        { role: "redo" },
        {
            label: "Screenshot",
            accelerator: "Shift+Ctrl+3",
            click() {
                var current_window = BrowserWindow.getFocusedWindow();
                current_window.webContents.capturePage().then((img) => {
                    fs.writeFileSync(userDataPath + "/TarpOS_files/fs/Documents/Screenshot from " + (new Date()).toString().replaceAll(":", ".") + ".png", img.toPNG());
                    document.body.style.animation = "whiteflash 1s";
                });
            }
        }
    ]
}, {
    label: "Emulator",
    submenu: [
        { role: "quit" },
        { role: "toggleDevTools" },
        { role: "togglefullscreen" },
    ]
}]));
boot();