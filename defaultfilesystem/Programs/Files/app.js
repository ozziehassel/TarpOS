(async function() {

var settings = await tarpcommands.fetchsystemdata();
document.body.style.fontFamily = settings.globalFont;

var pageURL = new URL(location.href);
var directory = pageURL.searchParams.get("path");
if (!directory) {
    directory = "";
}

document.querySelector("pre").innerText = directory;

var branches = await tarpcommands.dir(directory);

for (var branch of branches) {
    var li = document.createElement("li");
    document.querySelector("ul").appendChild(li);
    li.innerText = branch;
    li.style.cursor = "pointer";
    li.style.userSelect = "none";
    if ((await tarpcommands.dir(directory + "/" + branch)).constructor == Array) {
        // branch is folder
        li.addEventListener("click", function() {
            location.replace(`?processId=${getProcessId()}&path=${encodeURIComponent(directory + "/" + this)}`);
        }.bind(branch));
    }
    else {
        // branch is a file
        li.addEventListener("click", async function() {
            console.log(await tarpcommands.run("Viewer", {
                path: directory + "/" + this
            }));
        }.bind(branch));
    }
}

})();