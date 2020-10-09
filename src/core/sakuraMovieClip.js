(function(sakura){
    /**
     * 获取实例化后的MovieClip，为其添加额外属性和方法
     * @param obj
     * @returns {*}
     */
    sakura.movieClip = function(obj){
        var _width;
        var _height;
        var _bi = stage.viewRect.height / parseFloat(stage.canvas.style.height);
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
        /**
         * 设置mc位置
         * @type {Object}
         */
        obj.position = {
            /**
             * mc顶部对齐
             * @param  {[float]} _y [top偏移量，默认为0]
             * @return {[type]}    [description]
             */
            top: function(_y){
                _y = _y == undefined ? 0 : _y; 
                obj.y = Math.abs(parseFloat(stage.canvas.style.top)) * _bi + obj.regY + _y;
            },
            /**
             * mc左对齐
             * @param  {[float]} _x [left偏移量，默认为0]
             * @return {[type]}    [description]
             */
            left: function(_x){
                _x = _x == undefined ? 0 : _x;
                obj.x = obj.regX + _x;
            },
            /**
             * mc底部对齐
             * @param  {[float]} _y [bottom偏移量，默认为0]
             * @return {[type]}    [description]
             */
            bottom: function(_y){
                _y = _y == undefined ? 0 : _y;
                obj.y = stage.viewRect.height - Math.abs(parseFloat(stage.canvas.style.top)) * _bi - obj.height + obj.regY - _y;
            },
            /**
             * mc右对齐
             * @param  {[float]} _x [right偏移量，默认为0]
             * @return {[type]}    [description]
             */
            right: function(_x){
                _x = _x == undefined ? 0 : _x;
                obj.x = stage.viewRect.width - obj.width + obj.regX - _x;
            }
        }
        return obj;
    }
})(sakura || (sakura = {}));