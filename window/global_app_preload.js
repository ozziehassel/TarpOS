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