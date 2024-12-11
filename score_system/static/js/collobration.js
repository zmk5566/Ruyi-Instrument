var userName ;
var userColor ;


document.addEventListener('DOMContentLoaded', function() {
    userName = getCookie("userName");
    userColor = getCookie("userColor");

    if (!userName || !userColor) {
        document.getElementById("userInfoPopup").style.display = "block";
    } else {
        displayUserCharacter(userName, userColor);
    }
});

function setUser() {
     userName = document.getElementById("userName").value;
     userColor = document.getElementById("userColor").value;
    if (userName.trim() === "") return; // Basic validation

    setCookie("userName", userName, 7); // Set cookie for 7 days
    setCookie("userColor", userColor, 7);

    document.getElementById("userInfoPopup").style.display = "none";
    displayUserCharacter(userName, userColor);
    console.log(JSON.stringify({userName: userName, userColor: userColor}));

    websocket.send(JSON.stringify({userName: userName, userColor: userColor}));
}

function displayUserCharacter(userName, userColor) {
    const initial = userName.charAt(0).toUpperCase();
    const userCharacterDiv = document.getElementById("userCharacter");
    userCharacterDiv.style.display = "block";
    userCharacterDiv.innerHTML = `<div style="width:50px; height:50px; border-radius:50%; background-color:${userColor}; display:flex; justify-content:center; align-items:center; font-size:30px;">${initial}</div>`;
}

// Utility functions for cookies
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}