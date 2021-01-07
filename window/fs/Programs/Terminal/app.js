document.body.style.margin = 0;
document.body.style.backgroundColor = "#000000";
document.getElementById("terminalpre").innerText += "Starting TARP terminal...";
function typeBox() {
    document.getElementById("terminalpre").innerText += "\nTARP: ";
    input = document.createElement("code");
    input.contentEditable = "true";
    input.style.border = "none";
    input.style.backgroundColor = "black";
    input.style.color = "white";
    document.getElementById("terminalpre").appendChild(input);
    input.focus();
    // prevent losing cursor
    input.onblur = function(event) {
        this.focus();
    }
    input.onkeydown = function(event) {
        if (event.which == 13) {
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