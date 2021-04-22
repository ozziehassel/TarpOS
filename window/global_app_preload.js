var raw_tarp_cmd = async function(command) {
    var myPromise = new Promise(function(resolve, reject) {
        var messageHandle = function(e) {
            resolve(e.data);
            window.removeEventListener("message", messageHandle);
        };
        window.addEventListener("message", messageHandle);
    });
    window.parent.postMessage(command);
    var output = await myPromise;
    return output;
};

var tarpcommands = {};
var avail_commands = ["savefile", "fetchsystemdata", "dir", "run", "readfile", "requestrestart", "setsettings", "github"];
for (var cmd of avail_commands) {
    tarpcommands[cmd] = new Function(`return raw_tarp_cmd({name:"${cmd}",args:JSON.parse(JSON.stringify(arguments))});`);
}