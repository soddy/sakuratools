var ver = '1.2.3';
var sakura;
(function(sakura){
    /**
     * FIXED_WIDTH 根据屏幕宽度自适应，优先计算屏幕宽度，垂直方向，默认为Top，Left，底部有可能留白
     * FIXED_HEIGHT 根据屏幕高度自适应，优先计算屏幕高度，对齐方向，默认为Top，Center，两边有可能留白
     * FIXED_BOTH 根据屏幕宽度，高度自适应，对齐方向，默认为Top，Left，底部可能留白
     * @type {{FIXED_WIDTH: string, FIXED_HEIGHT: string, FIXED_BOTH: string}}
     */
    sakura.stageScaleMode = {
        FIXED_WIDTH: 'fixedWidth',
        FIXED_HEIGHT: 'fixedHeight',
        FIXED_BOTH: 'fixedBoth'
    };
    sakura.debug = false;
    sakura.ver = ver;
})(sakura || (sakura = {}));