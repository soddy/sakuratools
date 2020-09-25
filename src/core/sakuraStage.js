(function(sakura){
    /**
     * 继承扩展createjs中的Stage类
     * @param canvas    画布名称
     * @param desW      场景宽
     * @param desH      场景高
     * @param fps       动画帧数
     * @param scaleMode 显示模式，宽自适应，高自适应，宽高自适应
     * @param centerMode    true为居中对齐，false为左上对齐，默认true
     * @constructor
     */
    function Stage(canvas, desW, desH, fps, scaleMode, centerMode){
        this.Stage_constructor();
        this.canvas = document.getElementById(canvas);
        this.enableDOMEvents(true);     //开启鼠标事件
        this.stageLoadComplete = false; //场景加载完毕标记
        this.fps = fps;
        this.viewRect = {};   //canvas位移量
        this.debug();
        this.stageInit(desW, desH, scaleMode, centerMode);
        sakura.data = {};
    }
    //继承createjs.Stage
    var p = createjs.extend(Stage, createjs.Stage);
    /**
     * 初始化场景
     * @param desW  场景宽
     * @param desH  场景高
     * @param scaleMode 显示模式
     * @param centerMode    对齐方式
     */
    p.stageInit = function(desW, desH, scaleMode, centerMode){
        var _self = this;
        if(centerMode === void 0){ centerMode = true };
        var canvas = _self.canvas;
        var anim_container = document.getElementById("animation_container");
        var dom_overlay_container = document.getElementById("dom_overlay_container");
        window.addEventListener('resize', function(){
            setTimeout(resizeCanvas, 300);
        });
        resizeCanvas();
        function resizeCanvas() {
            var w = desW;
            var h = desH;
            var _canvasStyleWidth;
            var _canvasStyleHeight;
            var _canvasTop;
            var _canvasLeft;
            //iw 根据viewport得到的屏幕宽度，ih屏幕高度
            var iw = window.innerWidth,ih=window.innerHeight;
            //pRatio屏幕比例
            //var pRatio = window.devicePixelRatio;
            var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h;
            if(scaleMode == 'fixedWidth'){
                _canvasStyleWidth = w * xRatio;
                _canvasStyleHeight = h * xRatio;
                canvas.width = w * pRatio * xRatio;
                canvas.height = h * pRatio * xRatio;
                canvas.style.width = _canvasStyleWidth + 'px';
                canvas.style.height = _canvasStyleHeight + 'px';
                _self.sRatio = pRatio * xRatio;
            }else if(scaleMode == 'fixedHeight'){
                _canvasStyleWidth = w * yRatio;
                _canvasStyleHeight = h * yRatio;
                canvas.width = w * pRatio * yRatio;
                canvas.height = h * pRatio * yRatio;
                canvas.style.width = _canvasStyleWidth + 'px';
                canvas.style.height = _canvasStyleHeight + 'px';
                _self.sRatio = pRatio * yRatio;
            }else if(scaleMode == 'fixedBoth'){
                //先按照宽度撑满
                _canvasStyleWidth = w * xRatio;
                _canvasStyleHeight = h * xRatio;
                canvas.width = w * pRatio * xRatio;
                canvas.height = h * pRatio * xRatio;
                canvas.style.width = _canvasStyleWidth + 'px';
                canvas.style.height = _canvasStyleHeight + 'px';
                _self.sRatio = pRatio * xRatio;
                //如果canvas的高度<屏幕高度，再按照高度重新计算
                if(parseFloat(canvas.style.height) < ih){
                    _canvasStyleWidth = w * yRatio;
                    _canvasStyleHeight = h * yRatio;
                    canvas.width = w * pRatio * yRatio;
                    canvas.height = h * pRatio * yRatio;
                    canvas.style.width = _canvasStyleWidth + 'px';
                    canvas.style.height = _canvasStyleHeight + 'px';
                    _self.sRatio = pRatio * yRatio;
                }
            }
            if(centerMode){
                _canvasTop = (ih - parseFloat(canvas.style.height)) / 2;
                _canvasLeft = (iw - parseFloat(canvas.style.width)) / 2;
                dom_overlay_container.style.top = canvas.style.top = _canvasTop + 'px';
                dom_overlay_container.style.left = canvas.style.left = _canvasLeft + 'px';
            }else{
                _canvasTop = 0;
                _canvasLeft = 0;
                dom_overlay_container.style.top = canvas.style.top =  _canvasTop + 'px';
                dom_overlay_container.style.left = canvas.style.left = _canvasLeft + 'px';
            }
            anim_container.style.width = iw+'px';
            anim_container.style.height = ih+'px';
            dom_overlay_container.style.width = iw+'px';
            dom_overlay_container.style.height = ih+'px';
            _self.stageLoadComplete = true;
            var _viewRectX, _viewRectY, _viewRectWidth, _viewRectHeight;
            _viewRectX = _canvasLeft > 0 ? 0 : parseFloat(Math.abs((w/_canvasStyleWidth)*_canvasLeft).toFixed(2));
            _viewRectY = _canvasTop > 0 ? 0 : parseFloat(Math.abs(_canvasTop.toFixed(2))) * 2;
            _viewRectWidth = w;
            _viewRectHeight = h;
            _self.viewRect = {x: _viewRectX, y: _viewRectY, width: _viewRectWidth, height: _viewRectHeight};
        }
    };
    /**
     * 重写Stage监听方法
     * @param type
     * @param listener
     * @param useCapture
     * @returns {*}
     */
    p.addEventListener = function(type, listener, useCapture) {
        var _self = this;
        if(type === 'loaded'){
            //读取resource.js文件，判断文件是否存在以及文件中的resource.manifest是否为空，不为空就加载js文件
            var fileURL = 'js/libs/resource.js'; //文件路径（相对路径）
            var req = new XMLHttpRequest();
            req.open("GET",fileURL,true);
            req.addEventListener('load', function(){
                if(req.status==200){
                    var manifest = eval('(' + req.response + ')').manifest;
                    if(manifest.length != 0){
                        var loader = new createjs.LoadQueue(false);
                        loader.addEventListener("complete", function(){
                            _listener();
                        });
                        loader.loadManifest(manifest);
                    }else{
                        _listener();
                    }
                }else if(req.status==404){
                    _listener();
                }
            });
            req.send();
            function _listener(){
                var st = setInterval(function(){
                    if(_self.stageLoadComplete){
                        clearInterval(st);
                        listener(function(){
                            _self.scaleX = _self.sRatio;
                            _self.scaleY = _self.sRatio;
                            var anim_container = document.getElementById("animation_container");
                            anim_container.style.display = 'block';
                            createjs.Ticker.setFPS(_self.fps);
                            createjs.Ticker.addEventListener("tick", _self);
                            createjs.Touch.enable(_self);
                            return true;
                        }());
                    }
                },50);
            }
        }
        var listeners;
        if (useCapture) {
            listeners = this._captureListeners = this._captureListeners||{};
        } else {
            listeners = this._listeners = this._listeners||{};
        }
        var arr = listeners[type];
        if (arr) { this.removeEventListener(type, listener, useCapture); }
        arr = listeners[type]; // remove may have deleted the array
        if (!arr) { listeners[type] = [listener];  }
        else { arr.push(listener); }
        return listener;
    };
    p.debug = function(){
        if(sakura.debug){
            var loader = new createjs.LoadQueue(false);
            loader.loadFile('libs/vconsole.min.js');
            loader.on("fileload", function(){
                new VConsole();
            });
        }
    };
    sakura.Stage = createjs.promote(Stage, "Stage");
})(sakura || (sakura = {}));