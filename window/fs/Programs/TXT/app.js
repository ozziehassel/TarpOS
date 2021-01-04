function readTextArea(){
    var text = document.getElementById('textarea').value;
    if(document.getElementById('filename').value == undefined || ' ' || ''){
        var name = 'txt';
    }
    else{
        var name = document.getElementById('filename').value;
    }
    saveFile(name, 'Documents', 'txt', text);
}