include <base.scad>
include <hulu.scad>


c_y = [37,40,299,109,411,372,452];
c_x = [359,136,93,658,11,357,359];


scale([1,1,-1])flute_base();

translate([0,0,-100])hulu(c_x,c_y);