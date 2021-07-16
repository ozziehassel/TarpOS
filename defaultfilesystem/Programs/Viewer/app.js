(async function() {

var pageURL = new URL(location.href);
var filePath = pageURL.searchParams.get("path");
if (filePath) {
    var base64 = await tarpcommands.readfile(filePath, "base64");
    var mimeType = {
        txt: "text/plain",
        html: "text/plain",
        png: "image/png",
        jpg: "image/jpeg",
        mp4: "video/mp4",
        mp3: "audio/mp3",
        wav: "audio/wav"
    }[filePath.split(".").pop().toLowerCase()];
    var dataURI = `data:${mimeType};base64,${base64}`;
    document.querySelector("iframe").src = dataURI;

    if (mimeType == "text/plain") document.querySelector("iframe").style.backgroundColor = "white";
}

})();