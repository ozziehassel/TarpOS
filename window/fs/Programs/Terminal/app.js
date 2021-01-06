document.body.style.margin = 0;
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
            window.parent.postMessage({
                name: this.innerText.split(" ")[0],
                args: this.innerText.split(" ").splice(1, this.innerText.split("").length - 2)
            });
            return false;
        }
    }
}
setTimeout(typeBox, 2000);
window.addEventListener("message", function(event) {
    document.getElementById("terminalpre").innerText += "\n" + JSON.stringify(event.data);
    typeBox();
});