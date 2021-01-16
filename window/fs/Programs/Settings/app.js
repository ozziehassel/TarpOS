window.parent.postMessage({ name: "fetchsystemdata", args: [] });
window.addEventListener("message", function(event) {
    if ("globalFont" in event.data) {
        systemData = event.data;
        document.body.style.fontFamily = systemData.globalFont;
        form = document.querySelector("form");
        form.innerHTML += "Default window width: <input id='windoww' type='number' value='" + systemData.settings.defaultWindowWidth + "'/>";
        form.innerHTML += "<br />Default window height: <input id='windowh' type='number' value='" + systemData.settings.defaultWindowHeight + "'/>";
        form.innerHTML += "<br />System font: ";
        fontSelect = document.createElement("select");
        form.appendChild(fontSelect);
        for (font of systemData.availFonts) {
            option = document.createElement("option")
            option.innerText = font;
            fontSelect.appendChild(option);
        }
        fontSelect.value = systemData.globalFont;
        submitbutton = document.createElement("button");
        submitbutton.innerText = "Save settings and restart";
        document.body.appendChild(submitbutton);
        submitbutton.onclick = function() {
            window.parent.postMessage({name: 'setsettings', args: [parseFloat(document.getElementById("windoww").value), parseFloat(document.getElementById("windowh").value), fontSelect.value]});
        }
    }
});