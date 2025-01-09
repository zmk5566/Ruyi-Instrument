var userName ;
var userColor ;
var websocket;

let heartbeatInterval = null; // Define this at the top of your script

var retried_times = 0;

function getWebSocketUrl() {
    var protocolPrefix = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
    var host = window.location.hostname;
    var port = window.location.port ? ':' + window.location.port : '';
    var wsPath = "/ws/chat";
    return protocolPrefix + '//' + host + port + wsPath;
}


function createUserCircle(userName, userColor) {
    const initial = userName.charAt(0).toUpperCase();
    const circleHTML = `<div class='user_cycle' style="background-color:${userColor}; display:flex; justify-content:center; align-items:center;">${initial}</div>`;
    
    // Append to the usersContainer
    const usersContainer = document.getElementById("usersContainer");
    const div = document.createElement("div");
    div.innerHTML = circleHTML;
    usersContainer.appendChild(div.firstChild);
}


document.addEventListener('DOMContentLoaded', () => {
    // Connect to the WebSocket server
    websocket = new WebSocket("ws://localhost:8000/ws/chat");
    
    // Event listener for when the connection is open
    websocket.onopen = function(event) {
        //console.log("Connected to the WebSocket server");
        if (!heartbeatInterval) {
            heartbeatInterval = setInterval(sendHeartbeat, 3000);
        }
    };

    // Event listener for when a message is received
    websocket.onmessage = function(event) {
        //console.log("Message from server:", event.data);
        var data = JSON.parse(event.data);
        // if the message contains start, then start the animation
        //console.log(event);
        if (data.type === "command"){
            if (data.data === "start") {
                if (!synthControl.isStarted){
                    synthControl.play();
                }
            } else if (data.data === "stop") {
                synthControl.pause();
                synthControl.finished();
            } else if (data.data === "pause") {
                    synthControl.pause();
            }
        } 
        else if (data.type === "userList") {
            const usersContainer = document.getElementById("usersContainer");
            usersContainer.innerHTML = "";
            data.data.forEach(user => {
                createUserCircle(user.userName, user.userColor);
            });
        }


    };


});




document.addEventListener('DOMContentLoaded', function() {
    userName = getCookie("userName");
    userColor = getCookie("userColor");

    if (!userName || !userColor) {
        // remove the display none from the popup, but dont do block
        document.getElementById("userInfoPopup").style.display = "flex";
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
    const parentUserPanel = document.getElementById("user_pannel");

    parentUserPanel.style.display = "flex";

    const userCharacterDiv2 = document.getElementById("userCharacter");

    userCharacterDiv2.innerHTML = `<div style="width:50px; height:50px; border-radius:50%; background-color:${userColor}; display:flex; justify-content:center; align-items:center; font-size:30px;">${initial}</div>`;

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

// add a function to clear all the cookies

function clearCookies() {
    setCookie("userName", "", -1);
    setCookie("userColor", "", -1);
    location.reload();
}

function sendHeartbeat() {
    if (websocket.readyState === WebSocket.OPEN) {

        if (!userName ) {
            console.log("Username or userColor is not set");
            return;
        }else{
            const heartbeatMsg = JSON.stringify({ userName: userName, userColor: userColor });
            console.log("Sending heartbeat message", heartbeatMsg);
            websocket.send(heartbeatMsg);
        }

    }else{
        retried_times += 1;
        console.log("Websocket is not open");
        usersContainer.innerHTML = "";

        // clear the user 
    }
    if (retried_times > 3) {
        // reload the page
        location.reload();
    }
}
