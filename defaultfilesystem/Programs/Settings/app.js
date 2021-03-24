window.parent.postMessage({ name: "fetchsystemdata", args: [] });
window.addEventListener("message", function(event) {
    if ("globalFont" in event.data) {
        systemData = event.data;
        document.body.style.fontFamily = systemData.globalFont;
        form = document.querySelector("form");

        windoww = document.getElementById("windoww");
        windowh = document.getElementById("windowh");
        fontSelect = document.getElementById("font");
        submitbutton = document.getElementById("submit");

        windoww.value = systemData.settings.defaultWindowWidth;
        windowh.value = systemData.settings.defaultWindowHeight;
        for (font of systemData.availFonts) {
            option = document.createElement("option");
            option.innerText = font;
            fontSelect.appendChild(option);
        }
        fontSelect.value = systemData.globalFont;
        submitbutton.onclick = function() {
            window.parent.postMessage({name: 'setsettings', args: [
                parseFloat(windoww.value),
                parseFloat(windowh.value),
                fontSelect.value
            ]});
        }
    }
});