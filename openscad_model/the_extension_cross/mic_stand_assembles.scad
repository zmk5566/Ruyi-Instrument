board_width = 3;


module the_base_cross_x(){
 difference(){
translate([0,0,35])cylinder(h=70,r1=7,r2=7.25,center=true); 
translate([0,0,60])translate([-board_width/2,-25,-25])cube([board_width,50,70]);
translate([0,0,-15])translate([-2,-10,-25])cube([4,20,45]);

}
}


module the_base_cross_y(){
    
difference(){
translate([0,0,35+board_width/2])cylinder(h=70+board_width,r1=7,r2=7.25,center=true); 
translate([0,0,0])translate([-board_width/2,-25,-25])cube([board_width,50,60]);
translate([0,0,90-15])translate([-5.5,-10,-25])cube([11,20,60]);
}
    
    
    
    
    
}


module top_mic_shelf_inmp441(){

difference(){
    
translate([0,0,0])union(){
difference(){
translate([0,0,7.5])cylinder(h=15,r1=7,r2=7,center=true); 
translate([-5,-3.75,-9+7.5])cube([10,7.5,18]);
}
translate([-board_width/2,-6,-7.5+7.5])cube([board_width,12,15]);
}



translate([0,0,-70+20])the_base_cross_y();


}
    
    
}


projection(cut = true){

rotate([90,0,0])translate([35,0,0])the_base_cross_x();



rotate([90,0,0])translate([15,0,0])the_base_cross_y();


translate([0,-10,0])top_mic_shelf_inmp441();


translate([0,-25,0])top_mic_shelf_inmp441();



translate([0,-40,0])top_mic_shelf_inmp441();



translate([0,-55,0])top_mic_shelf_inmp441();

}


