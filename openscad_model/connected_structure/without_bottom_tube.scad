module hollow_cylinder(outer_diameter, inner_diameter, height) {
    difference() {
        // Outer Cylinder
        cylinder(h = height, r = outer_diameter / 2, $fn = 100);
        
        // Inner Cylinder to be removed
        translate([0, 0, -1])  // Slightly lower to ensure it cuts through the bottom face
            cylinder(h = height + 2, r = inner_diameter / 2, $fn = 100);  // Make it slightly taller to cut through top face too
    }
}

// Usage Example:

difference(){
    union(){
difference(){
    
    union(){
        hollow_cylinder(outer_diameter = 5.3, inner_diameter = 3.8, height = 20);
     difference() {
        translate([-5,-5,-5])cube([10,10,10]);
}
}
       translate([0,0,-4])cylinder(h = 18, r = 1.9, $fn = 100);
       translate([0,0,-8])cylinder(h = 3 + 4, r = 3.8 / 2, $fn = 100); 
       translate([5,0,0])rotate([0,150,0])translate([0,0,-4])cylinder(h = 5 + 2, r = 1.8 / 2,$fn = 100);
}

translate([5,0,0])rotate([0,150,0])translate([0,0,-4])hollow_cylinder(outer_diameter = 2.8, inner_diameter = 1.8, height = 18);
}
        translate([-4,-4,-4])cube(8,8,8);
}

//translate([-25,-25,-55])cube([50,50,50]); 