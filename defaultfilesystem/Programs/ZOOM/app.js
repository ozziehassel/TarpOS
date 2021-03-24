function joinMeeting(){
    document.getElementById("frame").src += document.getElementById("id").value + "#unlogin-join-form";
    document.getElementById("frame").scrolling = "no";
    document.getElementById("frame").style.display = "block";
    document.getElementById("form").style.display = "none";
    document.body.style.margin = "0";
}

pageURL = new URL(location.href);
preSetMeetingID = parseFloat(pageURL.searchParams.get("meetingid"));
if (preSetMeetingID) {
    document.getElementById("id").value = preSetMeetingID;
    joinMeeting();
}