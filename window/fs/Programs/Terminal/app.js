document.getElementById("terminalpre").innerText += "Starting TARP terminal...";
function typeBox() {
    document.getElementById("terminalpre").innerText += "\nTARP: ";
    input = document.createElement("span");
    input.contentEditable = "true";
    document.getElementById("terminalpre").appendChild(input);
    input.focus();
    // prevent losing cursor
    input.onblur = function(event) {
        this.focus();
    }
    input.onkeydown = function(event) {
        if (event.key == "Enter") {
            if (!this.innerText.replace(/\s/g, '').length) { typeBox(); }
            else {
                window.parent.postMessage({
                    name: parse_cmdline(this.innerText)[0],
                    args: parse_cmdline(this.innerText).splice(1, parse_cmdline(this.innerText).length - 1)
                });
            }
            return false;
        }
    }
}
setTimeout(typeBox, 2000);
window.addEventListener("message", function(event) {
    document.getElementById("terminalpre").innerText += "\n" + JSON.stringify(event.data);
    typeBox();
});