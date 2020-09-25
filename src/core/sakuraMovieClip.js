(function(sakura){
    /**
     * 获取实例化后的MovieClip，为其添加额外属性和方法
     * @param obj
     * @returns {*}
     */
    sakura.movieClip = function(obj){
        var _width;
        var _height;
        /**
         * Mc set和get width属性
         */
        Object.defineProperty(obj, 'width', {
            configurable: true,
            enumerable: true,
            get: function() {
                _width = obj.nominalBounds.width * obj.scaleX;
                return _width;
            },
            set: function(w) {
                obj.scaleX = w / obj.nominalBounds.width;
            }
        });
        /**
         * Mc set和get height属性
         */
        Object.defineProperty(obj, 'height', {
            configurable: true,
            enumerable: true,
            get: function() {
                _height = obj.nominalBounds.height * obj.scaleY;
                return _height;
            },
            set: function(h) {
                obj.scaleY = h / obj.nominalBounds.height;
            }
        });
        /**
         * 同时获取宽高
         * @returns {{w: *, h: *}}
         */
        obj.getWH = function(){
            return {w: this.width, h: this.height};
        };
        return obj;
    }
})(sakura || (sakura = {}));