function joinMeeting(){
    document.getElementById("frame").src += document.getElementById("id").value;
    document.getElementById("frame").style.display = "block";
    document.getElementById("form").style.display = "none";
}