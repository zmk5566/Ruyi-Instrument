// Binomial coefficient (n choose k)
function choose(n, k) = factorial(n) / (factorial(k) * factorial(n - k));

// Factorial function
function factorial(n) = n == 0 ? 1 : n * factorial(n - 1);

function sum_list(list, index = 0) =index < len(list) ?
        list[index] + sum_list(list, index + 1) :
        0;


// Function to calculate a single point on the Bezier curve
function bezierPoint(t,coordX,coordY) =[
    sum_list([for (i= [0 : len(coordX)-1]) coordX[i] * choose(len(coordX)-1, i) * pow(t, i) * pow(1-t, len(coordX)-1-i)])
    ,
    sum_list([for (i= [0 : len(coordY)-1]) coordY[i] * choose(len(coordY)-1, i) * pow(t, i) * pow(1-t, len(coordY)-1-i)])
];
    
function get_bezier_curve_points(t_step, c_x,c_y) = 
    [for(t = [0: t_step: 1]) bezierPoint(t,c_x,c_y)];
    

    
    
function convert_points(points,c_point) = 
    [for (point = points) [point[0]-c_point[0], point[1]-c_point[1]]];    
        

module hulu(c_x_input,c_y_input) { 

    the_points = get_bezier_curve_points(0.05,c_x_input,c_y_input);
    echo(the_points);
        
    center_point = the_points[0];

    new_points = convert_points(the_points,center_point);
        
    spin_path = concat(new_points,[new_points[0]]);

    rotate_extrude()polygon(spin_path/2);

}


    
   