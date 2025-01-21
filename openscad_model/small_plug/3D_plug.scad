$fn = 150;

module frustum(d1, d2, h) {
    difference() {
        // 创建圆台的外形
        cylinder(h = h, r1 = d1 / 2, r2 = d2 / 2);
        
        // 从顶部中心挖一个直径为 11.9mm 的圆柱
        translate([0,0,-1])
        cylinder(h = 11.1, r = 4 / 2);
    }
}

// 设置圆台的参数
diameter_bottom = 8.2; // 底部直径
diameter_top = 7.3;    // 顶部直径
height = 10;         // 圆台高度

// 绘制圆台
frustum(diameter_bottom, diameter_top, height);


