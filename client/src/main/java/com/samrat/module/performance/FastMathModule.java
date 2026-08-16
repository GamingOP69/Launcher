package com.samrat.module.performance;

import com.samrat.core.module.Category;
import com.samrat.core.module.Module;

public class FastMathModule extends Module {
    public FastMathModule() {
        super("Fast Math", "Accelerates trigonometry and square root calculations using lookup tables", Category.PERFORMANCE, 0, true);
    }
}
