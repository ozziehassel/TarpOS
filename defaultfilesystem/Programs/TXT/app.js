function readTextArea(){
    var text = document.getElementById('textarea').value;
    if(document.getElementById('filename').value == undefined || document.getElementById('filename').value == ' ' || document.getElementById('filename').value == ''){
        var name = 'txt';
    }
    else{
        var name = document.getElementById('filename').value;
    }
    window.parent.postMessage({
        name: "savefile",
        args: [name, "Documents", "txt", text]
    });
}