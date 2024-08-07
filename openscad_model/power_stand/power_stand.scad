outer_diameter = 18;

inner_diameter = 13;

outer_diameter_power = 25.5;

big_outer_diameter_power = 40;


inner_diameter_power_inner = 20;

module simple_round_stuff(){
    
difference(){
cylinder(h=5, d=outer_diameter);
translate([0,0,-1])cylinder(h=7, d=inner_diameter);
}

}


module simple_round_crecent_stuff(){
    
difference(){
cylinder(h=5, d=outer_diameter);
translate([0,0,-1])cylinder(h=7, d=inner_diameter);
translate([0,0,-1])cube(10);

}

}



module simple_power_stand_stuff(){
    
difference(){
cylinder(h=5, d=outer_diameter_power);
translate([0,0,-1])cylinder(h=7, d=inner_diameter_power_inner);
}

}


module simple_big_power_stand_stuff(){
    
difference(){
cylinder(h=5, d=big_outer_diameter_power);
translate([0,0,-1])cylinder(h=7, d=inner_diameter_power_inner);
}

}





module simple_big_round_crecent_stuff(){
    
difference(){
cylinder(h=5, d=outer_diameter_power);
translate([0,0,-1])cylinder(h=7, d=inner_diameter_power_inner);
translate([0,0,-1])cube(100);

}

}


module simple_big_round_crecent_stuff_special(){
    
difference(){
cylinder(h=5, d=outer_diameter_power);
translate([0,0,-1])cylinder(h=7, d=inner_diameter);
translate([0,0,-1])cube(100);

}

}




projection(cut = true){

translate([0,-70,0]){


for (i = [0 : 4]) {
    translate([i * 32, 88, 0])
        simple_power_stand_stuff();
}

for (i = [0 : 3]) {
    translate([i * 42+4, 130, 0])
        simple_big_power_stand_stuff();
}

for (i = [0 : 4]) {
    translate([i * 32, 170, 0])
        simple_big_round_crecent_stuff()
;
}


for (i = [0 : 4]) {
    translate([i * 32, 205, 0])
        simple_big_round_crecent_stuff_special()
;
}

}

}




//}

//simple_big_power_stand_stuff();
    
    

//simple_round_crecent_stuff();