$fn = 150;

module frustum(d1, d2, h) {
    difference() {
        // 创建圆台的外形
        cylinder(h = h, r1 = d1 / 2, r2 = d2 / 2);
        
        // 从顶部中心挖一个直径为 11.9mm 的圆柱
        translate([0,0,5.9])
        cylinder(h = 4.2, r = 11.9 / 2);
        translate([0,0,-0.01])
        cylinder(h = 6, r = 7.8 / 2);
    }
}

// 设置圆台的参数
diameter_bottom = 22; // 底部直径
diameter_top = 16;    // 顶部直径
height = 10;         // 圆台高度

// 绘制圆台
frustum(diameter_bottom, diameter_top, height);


