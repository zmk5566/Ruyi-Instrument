var unit_shift = 40;

var horizontal_bar_count =3;


function draw_score(abc_notation,x_shift, y_shift){
    // draw all the notes
    // draw all the connections
    // draw all the symbols
    var note_list = parse_notes(abc_notation);
    
    var total_svgContent = `<svg width="1400" height="600" xmlns="http://www.w3.org/2000/svg">
    <style>
    text {
      font-size: 20px;
      text-anchor: middle; /* Centers text horizontally */
      dominant-baseline: middle; /* Centers text vertically in some browsers */
    }
    </style>`;
    //cluster the notes by bar number nad ===-

    


    total_svgContent += draw_bar(note_list, x_shift, y_shift);

        // Closing the SVG tag
    total_svgContent += `</svg>`;
    return total_svgContent;
}

function parse_notes(abc_notation){
    // create a note list 
    var note_list = [];
    

    // split the abc_notation into individual bars, they are separated by "|"
    var bars = abc_notation.split("|");



    //console.log(bars);
    // iterate through the bars and parse the notes
    for(let i = 0; i < bars.length; i++){
        var temp_notes = splitNotes(bars[i]);
        //splitNotes(bars[i], note_list, i);
        for(let j = 0; j < temp_notes.length; j++){
             var note = parseNoteToMyNotation(temp_notes[j],i);
             note_list.push(note);
        }
    }

    console.log(note_list);
    return note_list;
        //parseNoteABC(bars[i], note_list,i);parseNoteABC


}

function draw_quarter_note (note, currentX, y_shift){
    // draw a quarter note
    // x_shift and y_shift are the coordinates of the note
    // the note is drawn at the coordinates (x_shift, y_shift)
                // Drawing two notes as per example, hardcoded positions which can be made dynamic
    var svgContent = "";
    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    svgContent += `<line x1="${currentX - 10}" y1="${y_shift + 10}" x2="${currentX + 10}" y2="${y_shift + 10}" stroke="black"/>`;
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }

    // Update the currentX position for the next note
    currentX += unit_shift;
    
    return {svgContent, currentX};
}


function draw_half_note (note, currentX, y_shift){
    
    var svgContent = "";

    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }
    currentX += unit_shift*2;

    console.log(svgContent);

    return {svgContent, currentX};
}

function draw_dotted_half_note (note, currentX, y_shift){

    var svgContent = "";
    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }
    currentX += unit_shift*1.5;

    return {svgContent, currentX};
}

function draw_whole_note (note, currentX, y_shift){

    var svgContent = "";
    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }
    currentX += unit_shift*4;

    return {svgContent, currentX};
}


function draw_dotted_whole_note (note, currentX, y_shift){

    var svgContent = "";
    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }
    currentX += unit_shift*6;

    return {svgContent, currentX};
}

function draw_double_whole_note (note, currentX, y_shift){

    var svgContent = "";
    svgContent += `<text x="${currentX}" y="${y_shift}" class="small">${note.note}</text>`;
    if (note.octave === 2) {
        svgContent += `<circle r="2" cx="${currentX}" cy="${y_shift + 15}" fill="black" />`;
    }
    currentX += unit_shift*8;

    return {svgContent, currentX};
}



function draw_note (note, x_shift, y_shift){

    // switch on the note duration, and draw the note accordingly. duration value can be 1,2,3,4,5,6

    var y_shift = y_shift;

    switch(note.duration){
        case 1:
            return draw_quarter_note(note, x_shift, y_shift);
        case 2:
            return draw_half_note(note, x_shift, y_shift);
        case 3:
            return draw_dotted_half_note(note, x_shift, y_shift);
        case 4:
            return draw_whole_note(note, x_shift, y_shift);
        case 5:
            return draw_dotted_whole_note(note, x_shift, y_shift); 
        case 6:
            return draw_dotted_whole_note(note, x_shift, y_shift);
        default:
            return draw_quarter_note(note, x_shift, y_shift);
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
            currentX = x_shift;
            y_shift += unit_shift;
            previous_bar_number = note_list[i].bar_number;
            console.log("new line");
        }
        var temp_object = draw_note (note_list[i], currentX, y_shift);
        console.log(note_list[i]);
        console.log(temp_object);
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
    const regex = /(\([A-Ga-g][,#b]?([,][0-9]+)?\)|[A-Ga-g][,#b]?[0-9]?)/g;
    
    // Use the regex to find matches and return them as an array.
    const matches = input.match(regex);

  
    if (matches) {
      return matches.map(match => match.replace(/\),/, "),")); // Clean up any trailing commas inside parenthesis groups
    } else {
      return []; // Return an empty array if no matches are found
    }
  }
  
  // Example use
  const input = "(E4 A,2)";
  console.log(splitNotes(input));
  

  function parseNoteToMyNotation(abcNote, bar_number) {
    console.log(abcNote);
    // Define a mapping for notes to numbers
    const noteMapping ={
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
        connection: null,
        symbol: null
    };
}


var test_node = {
    "note": 3,
    "octave": 3,
    "duration": 2,
    "bar_number": 1,
    "connection": null,
    "symbol": null
};


var svg_testaaa =  draw_half_note (test_node, 20, 0);
console.log(svg_testaaa.svgContent);