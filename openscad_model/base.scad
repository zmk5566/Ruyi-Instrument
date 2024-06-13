// Parameters for the flute body
flute_length = 336; // Length of the flute in mm
outer_diameter = 20; // Outer diameter of the flute in mm
wall_thickness = 2; // Thickness of the flute walls in mm

flute_left = 185;
flute_right=255;
side_outer_diameter = 14; // Outer diameter of the flute in mm

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

module left_harmonic_flute(){
        translate([0,+(side_outer_diameter/2+outer_diameter/2+wall_thickness*2),0]){
            scale([1,-1,1])difference(){
                difference() {
                    cylinder(h=flute_left, d=side_outer_diameter);
                    cylinder(h=flute_left + 2, d=side_outer_diameter - (2 * wall_thickness)); 
                }
                translate([0,0,flute_left-side_outer_diameter/2])rotate([45,0,180])translate([-25,0,-25])cube([50,50,50]);
            }
        }
}

module right_harmonic_flute(){
        translate([0,-(side_outer_diameter/2+outer_diameter/2+wall_thickness*2),0]){
            scale([1,+1,1])difference(){
                difference(){
                    cylinder(h=flute_right, d=side_outer_diameter);
                    cylinder(h=flute_right + 2, d=side_outer_diameter - (2 * wall_thickness)); 
                }
                //translate([0,0,flute_right])rotate([45,0,0])translate([-25,-75,-25])cube([50,100,50]);
                translate([0,0,flute_right-side_outer_diameter/2])rotate([45,0,180])translate([-25,0,-25])cube([50,50,50]);
            }
        }

}


// Combine modules to create the flute
module flute_base(){
    union(){
    
    left_harmonic_flute();
    right_harmonic_flute();


    difference() {
        fluteBody();
        drawHoles();
    }
    
    }
}

//flute_base();
