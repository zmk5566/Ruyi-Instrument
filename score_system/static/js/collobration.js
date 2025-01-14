var userName ;
var userColor ;
var websocket;
var current_pitch_value = 0;

let heartbeatInterval = null; // Define this at the top of your script

var retried_times = 0;

var recorded_past_play_list = [];

function getWebSocketUrl() {
    var protocolPrefix = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
    var host = window.location.hostname;
    var port = window.location.port ? ':' + window.location.port : '';
    var wsPath = "/ws/chat";
    return protocolPrefix + '//' + host + port + wsPath;
}

function clear_all_past_notes() {
    var svg = document.getElementById("past_notes");
    svg.innerHTML = "";
    recorded_past_play_list = [];


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
    websocket = new WebSocket(getWebSocketUrl());
    
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
                    //requestAnimationFrame(animateLine);
                }
            } else if (data.data === "stop") {
                synthControl.pause();
                synthControl.finished();
                synthControl.timer.currentTime = 0;
            } else if (data.data === "pause") {
                    synthControl.pause();
                    move_the_hover_box(global_x_shift,global_y_shift,0);
            }
        } 
        else if (data.type === "userList") {
            const usersContainer = document.getElementById("usersContainer");
            usersContainer.innerHTML = "";
            data.data.forEach(user => {
                createUserCircle(user.userName, user.userColor);
            });
        }else if (data.type === "instrument") {
            console.log("Instrument data", data);

            // check if the existing userName contains data.userNameID
            if (userName.includes(data.userNameID)) {
                // if the userNameID is the same as the current userName, then set the instrument
        
                current_pitch_value = data.data; 
                // create a json, containing the pitch value and the time
                var temp_json_value = {pitch: current_pitch_value, time: synthControl.timer.currentTime};
                recorded_past_play_list.push(temp_json_value);

                // maybe added a render function here
                create_past_note_svg(current_pitch_value,global_x_shift,global_y_shift,synthControl.timer.currentTime);

        }

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
            
            //console.log("Sending heartbeat message", heartbeatMsg);
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


function midiNoteToNumericalNotation(midiNumber, shift = 0) {
    // Define numerical notation with '1' corresponding to C, and so forth
    const notes = ['1', '1#', '2', '2#', '3', '4', '4#', '5', '5#', '6', '6#', '7'];
    
    // Calculate the position in the octave, taking into account the shift
    let noteIndex = (midiNumber + shift) % 12;
    
    // Ensure noteIndex is always positive
    noteIndex = (noteIndex + 12) % 12; 

    // Select the numerical note name from the notes array
    let noteName = notes[noteIndex];
    
    // Calculate the octave of the note, adjusting for the shift
    const octave = Math.floor((midiNumber + shift) / 12) - 1;

    if (current_pitch_value==0){
        return ``;
    }else{
        return `${noteName}`;
    }
}