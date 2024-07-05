// Use a high $fn value for smoother curves
$fn = 100;

module fluteBody() {


union(){
    
    translate([-2,-0.9,0])cube([6,1.8,5]);

    rotate([0,0,90])translate([-4.5,-1,0])cube([2.5,2,5]);
    rotate([0,0,-90])translate([-4.5,-1,0])cube([2.5,2,5]);

    difference (){

    cylinder(h = 5, r1 = 6, r2 = 6); // Creates a cylinder with height=10 and radius=5


    translate([0,0,-5])cylinder(h = 20, r1 = 3, r2 = 3); // Creates a cylinder with height=10 and radius=5

      
    }


}

}

module smallhole() {
    
    
union(){
    
    translate([-2,-1,0])cube([3,2,5]);

    //rotate([0,0,90])translate([-4.5,-1,0])cube([2.5,2,5]);
    //rotate([0,0,-90])translate([-4.5,-1,0])cube([2.5,2,5]);

    difference (){

    cylinder(h = 5, r1 = 5, r2 = 5); // Creates a cylinder with height=10 and radius=5


    translate([0,0,-5])cylinder(h = 20, r1 = 2, r2 = 2); // Creates a cylinder with height=10 and radius=5

      
    }


}
    
    
}






//projection(cut = true){


//translate([-10,0,0])smallhole();


module one_line(){
translate([-10,0,0])smallhole();
translate([0,0,0])fluteBody();
for (i = [0:1:6]) { // From 0 to 4, stepping by 1
    translate([6+12*i,0,0])translate([-1,-1.5,0])cube([2,3,5]);
    translate([6+6+12*i,0,0])fluteBody();
}

}

module moveit(){

    one_line();
    translate([85,6,0])translate([-1.9,-1.9,0])rotate([0,0,45])cube([3.8,3.8,5]);
    translate([-6,12,0])one_line();

}

//ftranslate([22,6,0])moveit();




projection(cut = true){
    translate([22,6,0])moveit();
}
//}
