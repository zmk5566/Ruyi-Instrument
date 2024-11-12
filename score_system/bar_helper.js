var unit_shift = 40;
var vertical_unit_shift = 80;
var horizontal_bar_count =3;
var bpm =60;
var x_shift = 20;
var y_shift = 40;
var total_duration = 0;
var websocket;

var abc = "T: 月光下的凤尾竹\n" +
"M: 3/4\n" +
"L: 1/8\n" +
"K:G\n" +
"Q:1/4=88\n" +
"(CuA,) (A,C) C2|(CD) (DE) E2|(ED) (DC) (CA,)|(C4 DC)|(A,6|A,6)u|CC (DE) E2|(EC) (DE) E2|(GC) (DE) E2|(EA,) (CD) D2u|(E4 A,2)|CC (DE) E2|(EC) (DE) E2|(GE) (GA) A2|G2 (CE) (~DC)|(C6|C6)|]";



document.addEventListener('DOMContentLoaded', () => {
    // Connect to the WebSocket server
    websocket = new WebSocket('ws://192.168.50.8:9000');
    
    // Event listener for when the connection is open
    websocket.onopen = function(event) {
        console.log("Connected to the WebSocket server");
    };

    // Event listener for when a message is received
    websocket.onmessage = function(event) {
        console.log("Message from server:", event.data);

        // if the message contains start, then start the animation
        if (event.data === "start"){
            const startButton = document.getElementById('startButton');
            startButton.click(); 
        } else if (event.data === "stop"){
            const stopButton = document.getElementById('stopButton');
            stopButton.click();
        }
    };


});


function getNotes(abc,staff_index){
    var staff_index = 0;
    var all_voices = getAllVoices(abc,staff_index);
    console.log(all_voices);
    return all_voices;
}

// write a function to translate the abc notation to the note list format we are using here
function abcToNoteList(abc){
    var notes = getNotes(abc,0);

    var all_notes = splitArrayByBarType(notes);
    console.log(all_notes);

    // do parse_notes_og_abc
    var all_notes_og_abc = parse_notes_og_abc(all_notes);

    return all_notes_og_abc;
}


function getAllVoices(abc,staff_index) {
        var parsed = ABCJS.parseOnly(abc);
        console.log(parsed);

        var voices = []; 

        // loop from all the lines
        for (var i = 0; i < parsed[0].lines.length; i++) {
            var line = parsed[0].lines[i];
            // loop through all the staffs
            //get the staff_index staff
            // console.log(line);
            // console.log(line.staff);

            // if the staff exists

            if (line.staff) {
                    if (line.staff[staff_index]) {
                    var staff = line.staff[staff_index];
                    // loop through all the voices,then append the voice to the voices array
                    var temp_voices = staff.voices[0];
                    console.log(temp_voices);
                    for (var j = 0; j < temp_voices.length; j++) {
                        voices.push(temp_voices[j]);
                    }
                }
                //console.log(line.staff[staff_index]);
            }




        }

        return voices;
    }




function startMS(){

    websocket.send("start");
}

function stopMS(){

    websocket.send("stop");
}


function getNotes(abc,staff_index){
    var staff_index = 0;
    var all_voices = getAllVoices(abc,staff_index);
    console.log(all_voices);
    return all_voices;
}

// write a function to translate the abc notation to the note list format we are using here
function abcToNoteList(abc){
    var notes = getNotes(abc,0);

    var all_notes = splitArrayByBarType(notes);
    console.log(all_notes);

    // do parse_notes_og_abc
    var all_notes_og_abc = parse_notes_og_abc(all_notes);

    return all_notes_og_abc;
}


function getAllVoices(abc,staff_index) {
        var parsed = ABCJS.parseOnly(abc);
        console.log(parsed);

        var voices = []; 

        // loop from all the lines
        for (var i = 0; i < parsed[0].lines.length; i++) {
            var line = parsed[0].lines[i];
            // loop through all the staffs
            //get the staff_index staff
            // console.log(line);
            // console.log(line.staff);

            // if the staff exists

            if (line.staff) {
                    if (line.staff[staff_index]) {
                    var staff = line.staff[staff_index];
                    // loop through all the voices,then append the voice to the voices array
                    var temp_voices = staff.voices[0];
                    console.log(temp_voices);
                    for (var j = 0; j < temp_voices.length; j++) {
                        voices.push(temp_voices[j]);
                    }
                }
                //console.log(line.staff[staff_index]);
            }




        }

        return voices;
    }




function draw_score(abc_notation,x_shift, y_shift){
    // draw all the notes
    // draw all the connections
    // draw all the symbols
    //var note_list = parse_notes(abc_notation);
    var note_list = abcToNoteList(abc_notation);

        // Add event listener to the button
    document.getElementById('sendWebStartButton').addEventListener('click', startMS);
    document.getElementById('sendWebStopButton').addEventListener('click', stopMS);
    
    var total_svgContent = `<svg width="1400" height="600" xmlns="http://www.w3.org/2000/svg">
    <style>
    text {
      font-size: 20px;
      text-anchor: middle; /* Centers text horizontally */
      dominant-baseline: middle; /* Centers text vertically in some browsers */
    }

    rect {
        fill: rgba(0, 216, 230, 0.6);
        stroke-width: 0;
    
    </style>`;
    //cluster the notes by bar number nad ===

    var total_bar_count = Math.floor(note_list[note_list.length-1].bar_number/horizontal_bar_count);
    console.log("total bar count" + total_bar_count);

    


    total_svgContent += draw_bar(note_list, x_shift, y_shift);

    total_svgContent += draw_base(note_list, x_shift, y_shift);

    total_svgContent += draw_beam(note_list, x_shift, y_shift);

    total_svgContent += draw_slur(note_list, x_shift, y_shift);


    total_svgContent += draw_the_hover_box(x_shift, y_shift,-2);


    console.log("finished drawing the bar");
    console.log(note_list);


    // draw the base 

        // Closing the SVG tag
    total_svgContent += `</svg>`;
    return total_svgContent;
}


function draw_beam(note_list, x_shift, y_shift) {
    let svgContent = "";
    let beamStartX = 0;
    let beamEndX = 0;
    let beamY = y_shift - 10; // Example offset above the notes
    let inBeam = false;

    var currentX = x_shift ;
    var previous_bar_number = 0;

    note_list.forEach((note, index) => {
        // Assuming draw_note provides the X position for each note
        let temp_object = draw_note (note, x_shift, y_shift);


        // if (note_list[index].bar_number !== previous_bar_number && note_list[index].bar_number%horizontal_bar_count== 0){
        //     currentX = x_shift;
        //     y_shift += vertical_unit_shift;
        //     previous_bar_number = note_list[index].bar_number;      
        //     beamY = y_shift - 10;      
        //     console.log("new line");
        // }

        var beamY = y_shift + unit_shift/4 + Math.floor(x_shift/(unit_shift*6*horizontal_bar_count) )*vertical_unit_shift;
        var beamX = x_shift% (unit_shift*6*horizontal_bar_count);

        
        //console.log("inside the beam loop");
        //console.log(temp_object);
        
        // If current note starts a beam
        if (note.symbol === "start_beam") {
            beamStartX = beamX-unit_shift/4;
            inBeam = true;
        }
        


        // If current note ends a beam
        if ( note.symbol ===  "end_beam" && inBeam) {
            beamEndX = beamX+unit_shift/4;
            
            // draw the beam
            svgContent += `<line x1="${beamStartX}" y1="${beamY}" x2="${beamEndX}" y2="${beamY}" stroke="black" stroke-width="1"/>`;
            
            
            //console.log("beam content");
            //console.log(svgContent);
            //console.log("beam status",beamStartX, beamEndX, beamY);
            
            inBeam = false; // Reset the flag as the beam has ended
        }

                // Update x_shift for the next note
                x_shift = temp_object.currentX;

    });

    return svgContent;
}


function draw_slur(note_list, x_shift, y_shift) {
    let svgContent = "";
    let beamStartX = 0;
    let beamEndX = 0;
    let inBeam = false;

    var currentX = x_shift ;
    var previous_bar_number = 0;

    note_list.forEach((note, index) => {
        // Assuming draw_note provides the X position for each note
        let temp_object = draw_note (note, x_shift, y_shift);


        // if (note_list[index].bar_number !== previous_bar_number && note_list[index].bar_number%horizontal_bar_count== 0){
        //     currentX = x_shift;
        //     y_shift += vertical_unit_shift;
        //     previous_bar_number = note_list[index].bar_number;      
        //     beamY = y_shift - 10;      
        //     console.log("new line");
        // }

        var beamY = y_shift - unit_shift/6*2.5 + Math.floor(x_shift/(unit_shift*6*horizontal_bar_count) )*vertical_unit_shift;
        var beamX = x_shift% (unit_shift*6*horizontal_bar_count);



        
        //console.log("inside the beam loop");
        //console.log(temp_object);
        
        // If current note starts a beam
        if (note.connection.is_connected && note.connection.start) {
            beamStartX = beamX;
            inBeam = true;
        }
        


        // If current note ends a beam
        if ( note.connection.is_connected && note.connection.end && inBeam) {
            beamEndX = beamX;
            
            // draw the beam
            //svgContent += `<line x1="${beamStartX}" y1="${beamY}" x2="${beamEndX}" y2="${beamY}" stroke="black" stroke-width="1"/>`;
            // draw the slur line
            // make sure the top point is the middle x position between the start and end

            var middleX = (beamStartX + beamEndX)/2;
            var middleY = beamY - (beamEndX-beamStartX)/6;
            svgContent += `<path d="M ${beamStartX} ${beamY} Q ${middleX} ${middleY} ${beamEndX} ${beamY}" stroke="black" fill="none" stroke-width="1"/>`;
            //console.log("beam content");
            //console.log(svgContent);
            //console.log("beam status",beamStartX, beamEndX, beamY);
            
            inBeam = false; // Reset the flag as the beam has ended
        }

                // Update x_shift for the next note
                x_shift = temp_object.currentX;

    });

    return svgContent;

}


function draw_base(note_list,x_shift, y_shift){
    

    // Initial setup for the SVG content

    var currentX = x_shift ;
    var svgContent = "";
    var previous_bar_number = 0;
    var curr_bar_number = 0;
    
    // draw notes
    // loop through the note list
    for(let i = 0; i < note_list.length; i++){




        // draw the note
        if (note_list[i].bar_number !== previous_bar_number && note_list[i].bar_number%horizontal_bar_count== 0){

      //draw the end of the bar line


            //currentX = x_shift;
            //y_shift += vertical_unit_shift;
            //previous_bar_number = note_list[i].bar_number;
            console.log("new line");
        }

        if (note_list[i].bar_number !== curr_bar_number){
            // draw a line to separate the bars
            svgContent += `<line x1="${currentX-unit_shift/2}" y1="${y_shift-unit_shift/2}" x2="${currentX-unit_shift/2}" y2="${y_shift+vertical_unit_shift/2-unit_shift/2}" stroke="black" stroke-width="1.5"/>`;
            curr_bar_number = note_list[i].bar_number;
            }

            if (note_list[i].bar_number !== previous_bar_number && note_list[i].bar_number%horizontal_bar_count== 0){

                //draw the end of the bar line
          
          
                      currentX = x_shift;
                      y_shift += vertical_unit_shift;
                      previous_bar_number = note_list[i].bar_number;
                      //console.log("new line");
                  }

            var temp_object = draw_note (note_list[i], currentX, y_shift);
            //console.log(note_list[i]);
            //console.log(temp_object);
            temp_svgContent =temp_object.svgContent;
            currentX = temp_object.currentX;


        //console.log(temp_svgContent);
        //svgContent +=  temp_svgContent;

        // if this is the last note, then draw the great double bar line
        if (i == note_list.length-1){
            svgContent += `<line x1="${currentX-unit_shift/2-3}" y1="${y_shift-unit_shift/2}" x2="${currentX-unit_shift/2-3}" y2="${y_shift+vertical_unit_shift/2-unit_shift/2}" stroke="black" stroke-width="1.5"/>`;
            svgContent += `<line x1="${currentX-unit_shift/2+3}" y1="${y_shift-unit_shift/2}" x2="${currentX-unit_shift/2+3}" y2="${y_shift+vertical_unit_shift/2-unit_shift/2}" stroke="black" stroke-width="4"/>`;

        }



         
    }



    return svgContent;



    return svgContent;



}

function draw_the_hover_box(x_shift, y_shift,current_time){

    // display the hover box

    var svgContent = "";
    // draw the box with size unit_shift/2,unit_shift
    // for one bar, it means 3 seconds( 3*60/bpm)
    // for one quarter note, it means 1.5 seconds
    // one second will move 40 units
    // so we can calculate the position of the hover box
    var currentX = x_shift + current_time*unit_shift-unit_shift/4;
    //console.log("currentX" + currentX);
    var currentY = y_shift - unit_shift/2 + Math.floor(currentX/(unit_shift*6*horizontal_bar_count) )*vertical_unit_shift;

    svgContent += `<rect id = "the_hover" x="${currentX}" y="${currentY}" width="${unit_shift/2}" height="${unit_shift}"  stroke="none" stroke-width="0"/>`;

    return svgContent;


}

function move_the_hover_box(x_shift, y_shift,current_time){
    
    var the_hover = document.getElementById("the_hover");
    var currentX = x_shift + current_time*unit_shift-unit_shift/4;
    var currentY = y_shift - unit_shift/2 + Math.floor(currentX/(unit_shift*6*horizontal_bar_count) )*vertical_unit_shift;
    currentX = currentX % (unit_shift*6*horizontal_bar_count);
    the_hover.setAttribute("x", currentX);
    the_hover.setAttribute("y", currentY);




}




function splitArrayByBarType(data) {
    const result = [];
    let currentGroup = [];

    data.forEach(item => {
        // Check if the item has a 'type' key and includes 'bar' in its value
        if (item.type && item.type.includes('bar')) {
            // When a bar is found, push the current group to the result
            // and start a new group only if the current group is not empty
            if (currentGroup.length > 0) {
                result.push(currentGroup);
                currentGroup = [];
            }
            // Optionally, include the bar element itself into the result as a separate group
            // Uncomment the next line if you want each bar element to be in its own group
            // result.push([item]);
        } else {
            // Add the item to the current group
            currentGroup.push(item);
        }
    });

    // After the loop, add any remaining items as the last group
    if (currentGroup.length > 0) {
        result.push(currentGroup);
    }

    return result;
}







function parse_notes_og_abc(abc_notation){
    // create a note list 
    var note_list = [];

    

    // split the abc_notation into individual bars, they are separated by "|"
    var bars = splitArrayByBarType(abc_notation)[0];


    console.log("bars");
    console.log(splitArrayByBarType(abc_notation[0]));
    // iterate through the bars and parse the notes
    for(let i = 0; i < bars.length; i++){
        var temp_notes = bars[i];
        //console.log("temp_notes");
        //console.log(temp_notes);
        //splitNotes(bars[i], note_list, i);
        for(let j = 0; j < temp_notes.length; j++){
            //console.log("temp_notes[j]");
            //console.log(temp_notes[j]);
             var note = parseAbcNoteToMyNotation(temp_notes[j],i);
             
             total_duration += note.duration;
             //console.log(total_duration);
             note_list.push(note);
        }
    }

    //console.log(note_list);
    return note_list;
        //parseNoteABC(bars[i], note_list,i);parseNoteABC


}

function draw_quarter_note (note, decoration_svg,currentX, y_shift){
    // draw a quarter note
    // x_shift and y_shift are the coordinates of the note
    // the note is drawn at the coordinates (x_shift, y_shift)
                // Drawing two notes as per example, hardcoded positions which can be made dynamic
    var svgContent = "";
    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    
    
    // check does the note exist a beam, if not draw a line
    if (note.symbol === "start_beam"|| note.symbol === "end_beam"){
//do nothing
    }else{
    svgContent += `<line x1="${currentX - 10}" y1="${y_shift + 10}" x2="${currentX + 10}" y2="${y_shift + 10}" stroke="black"/> stroke-width="1"`;
    }   
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }

    // Update the currentX position for the next note
    currentX += unit_shift;
    svgContent+= decoration_svg;

    return {svgContent, currentX};
}


function draw_half_note (note, decoration_svg,currentX, y_shift){
    
    var svgContent = "";

    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;

    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }
    currentX += unit_shift*2;

    //console.log(svgContent);
    svgContent+= decoration_svg;

    return {svgContent, currentX};
}

function draw_dotted_half_note (note, decoration_svg,currentX, y_shift){

    var svgContent = "";
    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }
    currentX += unit_shift*1.5;
    svgContent+= decoration_svg;

    return {svgContent, currentX};
}

function draw_whole_note (note, decoration_svg,currentX, y_shift){

    var svgContent = "";
    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }

     // draw a line instead of -, which is a half note
    svgContent += `<line x1="${currentX +unit_shift*2- 7}" y1="${y_shift}" x2="${currentX + 7+unit_shift*2}" y2="${y_shift }" stroke="black" stroke-width="2"/> `;

    currentX += unit_shift*4;

    svgContent+= decoration_svg;

    return {svgContent, currentX};
}


function draw_dotted_whole_note (note, decoration_svg,currentX, y_shift){

    var svgContent = "";
    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }

    // draw a line instead of -, which is a half note
    svgContent += `<line x1="${currentX +unit_shift*2- 7}" y1="${y_shift}" x2="${currentX + 7+unit_shift*2}" y2="${y_shift }" stroke="black" stroke-width="2"/> `;
    svgContent += `<line x1="${currentX +unit_shift*4- 7}" y1="${y_shift}" x2="${currentX + 7+unit_shift*4}" y2="${y_shift }" stroke="black" stroke-width="2"/> `;


    currentX += unit_shift*6;

    svgContent+= decoration_svg;

    //console.log(decoration_svg)


    return {svgContent, currentX};
}

function draw_double_whole_note (note,decoration_svg, currentX, y_shift){

    var svgContent = "";
    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }

    svgContent += `<line x1="${currentX +unit_shift*2- 7}" y1="${y_shift}" x2="${currentX + 7+unit_shift*2}" y2="${y_shift }" stroke="black" stroke-width="2"/> `;
    svgContent += `<line x1="${currentX +unit_shift*4- 7}" y1="${y_shift}" x2="${currentX + 7+unit_shift*4}" y2="${y_shift }" stroke="black" stroke-width="2"/> `;
    currentX += unit_shift*8;

    svgContent+= decoration_svg;

    return {svgContent, currentX};
}



function draw_note (note, x_shift, y_shift){

    // switch on the note duration, and draw the note accordingly. duration value can be 1,2,3,4,5,6

    var y_shift = y_shift;

    var temp_svgContent = "";

    // draw the decorations
    if (note.decorations){
        for (let i = 0; i < note.decorations.length; i++){
            if (note.decorations[i] === "upbow"){
                var temp_y_shift = y_shift- unit_shift/6*4;
                temp_svgContent = `<text x="${x_shift-unit_shift/4}" y="${temp_y_shift}" class="small">v</text>`;
            }
        }
    }

    switch(note.duration){
        case 1:
            return draw_quarter_note(note,temp_svgContent, x_shift, y_shift);
        case 2:
            return draw_half_note(note, temp_svgContent,x_shift, y_shift);
        case 3:
            return draw_dotted_half_note(note, temp_svgContent,x_shift, y_shift);
        case 4:
            return draw_whole_note(note, temp_svgContent,x_shift, y_shift);
        case 5:
            return draw_dotted_whole_note(note, temp_svgContent,x_shift, y_shift); 
        case 6:
            return draw_dotted_whole_note(note, temp_svgContent,x_shift, y_shift);
        default:
            return draw_quarter_note(note, temp_svgContent,x_shift, y_shift);
    }



}









function draw_bar(note_list, x_shift, y_shift) {
    // Initial setup for the SVG content

    var currentX = x_shift ;
    var svgContent = "";
    var previous_bar_number = 0;
    
    // draw notes
    // loop through the note list
    for(let i = 0; i < note_list.length; i++){

        // draw the note
        if (note_list[i].bar_number !== previous_bar_number && note_list[i].bar_number%horizontal_bar_count== 0){

      //draw the end of the bar line


            currentX = x_shift;
            y_shift += vertical_unit_shift;
            previous_bar_number = note_list[i].bar_number;
            //console.log("new line");
        }

        note_list[i].y_pos = y_shift;
        note_list[i].x_pos = currentX;

        var temp_object = draw_note (note_list[i], currentX, y_shift);
        //console.log(note_list[i]);
        //console.log(temp_object);
        temp_svgContent =temp_object.svgContent;
        currentX = temp_object.currentX;
        //console.log(temp_svgContent);
        svgContent +=  temp_svgContent;



         
    }

    return svgContent;
}

// // Example usage:
// const abcNotation = "(CA,) (A,C) C2|(CD) (DE) E2";
// const xShift = 0;
// const yShift = 0;
// const test_out = parse_notes(abcNotation);
// //const svgOutput = draw_bar(abcNotation, xShift, yShift);
// console.log(test_out);




function splitNotes(input) {
    // This regular expression matches:
    // 1. Grouped notes enclosed in parentheses, capturing the entire grouping.
    // 2. Individual notes with optional commas or numbers following them.
    const regex = /(\([A-Za-z][,#b]?([,][0-9]+)?\)|[A-Za-z][,#b]?[0-9]?)/g;
    
    // Use the regex to find matches and return them as an array.
    const matches = input.match(regex);

  
    if (matches) {
      return matches.map(match => match); // Clean up any trailing commas inside parenthesis groups
    } else {
      return []; // Return an empty array if no matches are found
    }
  }
  
  // Example use
  const input = "(CA,) (A,C) C2|(CD) (DE) E2";
  console.log(splitNotes(input));
  

// parse a abc notation style note to my style
// here is an example of abc notation
//    {
//     "pitches": [
//         {
//             "pitch": 0,
//             "name": "C",
//             "startSlur": [
//                 {
//                     "label": 101
//                 }
//             ],
//             "verticalPos": 0
//         }
//     ],
//     "duration": 0.125,
//     "el_type": "note",
//     "startChar": 38,
//     "endChar": 40,
//     "startBeam": true
// }

function parseAbcNoteToMyNotation(abcNote, bar_number) {
    // Define a mapping for notes to numbers
    //console.log(abcNote);

    // write a function if the abcNote.pitches is less than 0, then add 7 to it and decrease the octave by 1





    var note = abcNote.pitches[0].pitch;
    var octave = 3;
    var connection = {"is_connected":false};
    if (note < 0){
        note+= 7;
        octave -= 1;
    }

    //console.log("current pitch");
    //console.log(abcNote.pitches[0].pitch);

    // check whether it exist a key called startBeam, if so, mark the symbol has true
    var symbol = "";

    if (abcNote.startBeam){
        symbol = "start_beam";
    }
    // if whether it exist a key called endBeam, if so, mark the symbol has true
    if (abcNote.endBeam){
        //console.log("actual end beam")
        symbol = "end_beam";
    }


    if (abcNote.pitches[0].startSlur){
        console.log(abcNote.pitches[0].startSlur[0].label);
        connection = {"is_connected":true, "start": true,"slur_id":abcNote.pitches[0].startSlur[0].label};
    }

    if (abcNote.pitches[0].endSlur){
        connection = {"is_connected":true, "end": true,"slur_id":abcNote.pitches[0].endSlur[0]};

    }


    return {
        note: note+1,
        octave: octave,
        y_bar_shift: Math.floor(bar_number/horizontal_bar_count),
        duration: parseInt(abcNote.duration/0.125),
        bar_number: bar_number,
        connection: connection,
        x_pos: -1,
        y_pos: -1,
        decorations: abcNote.decoration,
        symbol: symbol
    };

}


  function parseNoteToMyNotation(abcNote, bar_number) {
    console.log(abcNote);
    // Define a mapping for notes to numbers
    const noteMapping ={
        "Z": 0,
        "C": 1,
        "D": 2,
        "E": 3,
        "F": 4,
        "G": 5,
        "A": 6,
        "B": 7
    };

    // Initial values
    let noteValue = null;
    let octave = 4; // Default octave
    let duration = 1; // Default duration
    let connection = false;

    // check whether the note has "(", if so, mark the connection has true
    if (abcNote.includes("(")){
        connection = true;
    }

    // Extract the note, check for octave indicators (',') and duration
    for (let i = 0; i < abcNote.length; i++) {
        const char = abcNote[i].toUpperCase();
        if (noteMapping.hasOwnProperty(char)) {
            noteValue = noteMapping[char];
            // Adjust octave based on case of the letter
            octave += abcNote[i] === abcNote[i].toLowerCase() ? 0 : -1;
        } else if (char === ',') {
            octave--; // Lower octave for each comma
        } else if (!isNaN(parseInt(char))) {
            duration = parseInt(abcNote.substring(i)); // Assumes rest are duration
            break; // Exit loop once duration is found
        }
    }


    return {
        note: noteValue,
        octave: octave,
        y_bar_shift: Math.floor(bar_number/horizontal_bar_count),
        duration: duration,
        bar_number: bar_number,
        connection: connection,
        symbol: null,
        x_pos: -1,
        y_pos: -1,
        decorations: []
    };
}


var test_node = {
    "note": 3,
    "octave": 3,
    "duration": 2,
    "bar_number": 1,
    "connection": null,
    "symbol": null,
    "x_pos": -1,
    "y_pos": -1,
    "decorations": []
};


document.addEventListener('DOMContentLoaded', (event) => {
    const startButton = document.getElementById('startButton');
    let startTime;
    let animationFrameId;

    startButton.addEventListener('click', () => {
        // Ensure Tone.js is started
        if (Tone.context.state !== 'running') {
            Tone.start();
        }

        startTime = Tone.now(); // Capture the start time
        requestAnimationFrame(animateLine); // Start the animation
    });

    // add the stop button logic 
    const stopButton = document.getElementById('stopButton');
    stopButton.addEventListener('click', () => {
        cancelAnimationFrame(animationFrameId);
        // Reset the hover box to the initial position
        move_the_hover_box(x_shift, y_shift,-2);
    });

    function animateLine() {
        const currentTime = Tone.now();
        const timeElapsed = currentTime - startTime; // Time elapsed since button was clicked
        
        move_the_hover_box(x_shift, y_shift,timeElapsed);

        // Continue the animation if not reached the end
        if (timeElapsed < total_duration) {
            animationFrameId = requestAnimationFrame(animateLine);
        }
    }
});


