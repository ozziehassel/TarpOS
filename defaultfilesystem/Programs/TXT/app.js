function readTextArea(){
    var text = document.getElementById('textarea').value;
    if(document.getElementById('filename').value == undefined || document.getElementById('filename').value == ' ' || document.getElementById('filename').value == ''){
        var name = 'txt';
    }
    else{
        var name = document.getElementById('filename').value;
    }
    tarpcommands.savefile(name, "Documents", "txt", text).then();
}