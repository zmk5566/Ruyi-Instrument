// Parameters for the flute body
flute_length = 336; // Length of the flute in mm
outer_diameter = 20; // Outer diameter of the flute in mm
wall_thickness = 2; // Thickness of the flute walls in mm

// Parameters for the holes
hole_diameter = 8; // Diameter of each hole in mm
front_hole_positions = [124, 150, 171, 194, 205.5, 229]; // Positions of holes from the mouthpiece end
back_hole_positions = [111.5,291,311];


module fluteBody() {
    difference() {
        cylinder(h=flute_length, d=outer_diameter);
        
        translate([0, 0, -1]) // Slightly lower to ensure it cuts through
            cylinder(h=flute_length + 2, d=outer_diameter - (2 * wall_thickness)); 
    }
}

module hole(position,direction) {
    translate([0, 0, position]) // Adjusted translation to position holes along the length
    translate([(outer_diameter/2-wall_thickness)*direction, 0, 0]) // Moves the hole to the surface
    rotate([0,90,0]) // Rotate to align the hole cutting on the side
    
    translate([0,0,-(wall_thickness*2)/2])
    cylinder(h=wall_thickness*2, d=hole_diameter, $fn=100); // Ensure the hole cuts through with a bit extra depth
}

module drawHoles() {
    for (pos = front_hole_positions) {
        hole(pos,1);
    }
    for (pos = back_hole_positions) {
        hole(pos,-1);
    }
}

// Combine modules to create the flute

difference() {
    fluteBody();
    drawHoles();
}