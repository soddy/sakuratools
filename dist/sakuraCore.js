var ver = '1.0.0';
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
(function(sakura){
    var r = (new Date()).valueOf();
    // 加载资源数和总资源数的比
    var _loadPer = 0;
    //要加载的总资源数
    var _totalLoadRes = 0;
    //单个文件资源比
    var _loadSinglePer = 0;
    //当前已经加载的资源数
    var _loadedLoadRes = 0;
    //加载资源返回blob写入_images
    var _images = {};

    sakura.loadScene = function(sceneName, progressFun, completeFun){
        _loadPer = _totalLoadRes = _loadSinglePer = _loadedLoadRes = 0;
        _images = {};
        sakura.data.resource = {};
        //判断是否是字符串
        if(typeof(sceneName) === 'string'){
            var loader = new createjs.LoadQueue(false);
            if(sceneName.indexOf('.json')!=-1){
                //json文件
                loader.loadManifest('resource/'+sceneName);
                loader.on("fileload", function(e){
                    var manifestArr = e.result;
                    manifestArr = manifestArr.delEmptyObj();
                    if(manifestArr.length != 0) {
                        _onRESProgress(manifestArr, function (pre) {
                            progressFun(pre);
                        }, function (e) {
                            completeFun(e);
                        });
                    }else{
                        progressFun(100);
                        completeFun(true);
                    }
                });
            }else{
                //class文件
                var fileArr = [];
                fileArr.push('animatejs/'+ sceneName +'.js?'+r);
                fileArr.push('js/'+ sceneName +'Class.js?'+r);
                loader.loadManifest(fileArr);
                loader.on("complete", function(){
                    var manifestArr = get_class_name(sceneName).properties.manifest;
                    manifestArr = manifestArr.delEmptyObj();
                    if(manifestArr.length != 0) {
                        _onRESProgress(manifestArr, function (pre) {
                            progressFun(pre);
                        }, function (e) {
                            //所有资源加载完成                      
                            var ssMetadata = get_class_name(sceneName).ssMetadata;
                            if(ssMetadata.length != 0){
                                for(var i=0;i<ssMetadata.length;i++){
                                    ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [images[ssMetadata[i].name]], "frames": ssMetadata[i].frames} )
                                }
                            }
                            completeFun(e);
                        });
                    }else{
                        progressFun(100);
                        completeFun(true);
                    }
                });
            }
        }else if(Array.isArray(sceneName)){
            sceneName = sceneName.unique3();
            var fileArr = [];
            var jsonFileArr = [];
            var manifest = undefined;
            var sceneName_ = [];
            for(var i=0;i<sceneName.length;i++){
                //先判断有没有json文件，如果有，先处理json文件
                if(typeof(sceneName[i]) === 'string'){
                    if(sceneName[i].indexOf('.json')!=-1){
                        jsonFileArr.push('resource/'+sceneName[i]);
                    }else{
                        fileArr.push('animatejs/'+ sceneName[i] +'.js?'+r);
                        fileArr.push('js/'+ sceneName[i] +'Class.js?'+r);
                        sceneName_.push(sceneName[i]);
                    }
                }else if(!Array.isArray(sceneName[i]) && sceneName[i] !== undefined){
                    if(sceneName[i].hasOwnProperty('manifest')){
                        manifest = sceneName[i];
                    }
                }
            }
            var loader = new createjs.LoadQueue(false);
            var jsonManifest = [];
            var loadFlag = true;    //json文件是否load完成
            if(jsonFileArr.length>0){
                loader.loadManifest(jsonFileArr);
                loader.on("fileload", function(e){
                    jsonManifest.push(e.result[0]);
                    loadFlag = false;
                });
                loader.on("error", function(e){
                    loadFlag = false;
                });
            }else{
                loadFlag = false;   //如果没有json文件，相当于直接load json文件完成
            }
            var st = setInterval(function(){
                if(!loadFlag){
                    clearInterval(st);
                    var loader1 = new createjs.LoadQueue(false);
                    loader1.loadManifest(fileArr);
                    loader1.on("complete", function(){
                        var manifestArr = [];
                        var ssMetadata = [];
                        for(var i=0;i<sceneName_.length;i++){
                            manifestArr = manifestArr.concat(get_class_name(sceneName_[i]).properties.manifest);
                            ssMetadata = ssMetadata.concat(get_class_name(sceneName_[i]).ssMetadata);
                        }
                        if(jsonManifest.length>0){
                            manifestArr = manifestArr.concat(jsonManifest);
                        }
                        if(manifest != undefined){
                            manifestArr = manifestArr.concat(manifest['manifest']);
                        }
                        manifestArr = manifestArr.delEmptyObj();
                        if(manifestArr.length != 0){
                            manifestArr = uniqe_by_keys(manifestArr, ['src','id']);
                            _onRESProgress(manifestArr, function(pre){
                                progressFun(pre);
                            }, function(e){
                                //所有资源加载完成
                                if(ssMetadata.length != 0){
                                    ssMetadata = uniqe_by_keys(ssMetadata, ['name','frames']);
                                    for(var i=0;i<ssMetadata.length;i++){
                                        ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [images[ssMetadata[i].name]], "frames": ssMetadata[i].frames} )
                                    }
                                }
                                completeFun(e);
                            });
                        }else{
                            progressFun(100);
                            completeFun(true);
                        }
                    });
                }
            },20);
        }else if(!Array.isArray(sceneName) && sceneName !== undefined){
            if(sceneName.hasOwnProperty('manifest')){
                if(sceneName.manifest.length != 0){
                    var manifestArr = uniqe_by_keys(sceneName.manifest, ['src','id']);
                    manifestArr = manifestArr.delEmptyObj();
                    if(manifestArr.length != 0){
                        _onRESProgress(manifestArr, function(pre){
                            progressFun(pre);
                        }, function(e){
                            completeFun(e);
                        });
                    }else{
                        progressFun(100);
                        completeFun(true);
                    }
                }else{
                    progressFun(100);
                    completeFun(true);
                }
            }
        }
        function _onRESProgress(manifestArr, progressFun, completeFun) {
            if(manifestArr.length > 0){
                _totalLoadRes = manifestArr.length;
                _loadSinglePer = 1 / _totalLoadRes;
                var urlLoader = new sakura.UrlLoader();
                sakura.loadMulti(0, manifestArr, urlLoader);
                if(progressFun){
                    var st = setInterval(function(){
                        if(urlLoader.getTotal() !=0){
                            if(_loadedLoadRes == _totalLoadRes){
                                clearInterval(st);
                                progressFun(100);
                                if(completeFun){
                                    completeFun(true);
                                }
                            }else{
                                progressFun(parseInt((_loadPer + urlLoader.getLoaded() / urlLoader.getTotal() * _loadSinglePer) * 100));
                            }
                        }
                    },20);
                }
            }
        }
    };
    sakura.loadMulti = function(index, resourceArr, urlLoader){
        if(index < resourceArr.length){
            urlLoader.load(resourceArr[index].src, resourceArr[index].id, function(e){
                if(typeof(images)!='undefined'){
                    images[resourceArr[index].id] = e;
                }
                _loadPer += _loadSinglePer;
                index++;
                _loadedLoadRes = index;
                sakura.loadMulti(index, resourceArr, urlLoader);
            });
        }
    };
    sakura.UrlLoader = function(){
        this.loaded = 0;
        this.total = 0;
        this.load = function(url, id, callbackFun){
            var _self = this;
            _self.loaded = 0;
            _self.total = 0;
            var req = new XMLHttpRequest();
            req.open('GET', url, true);
            req.addEventListener('progress', function(evt){
                if(evt.lengthComputable){
                    _self.loaded = evt.loaded;
                    _self.total = evt.total;
                }
            }, false);
            req.responseType = "blob";
            req.addEventListener('load', function(){
                window.URL = window.URL || window.webkitURL;
                if (this.status === 200) {
                    var blob = this.response;

                    var imgRegex = /([^\s]+(?=\.(jpg|png|jpeg|gif))\.\2)/gi;
                    var videoRegex = /([^\s]+(?=\.(ac3|m4a|mp3|ogg))\.\2)/gi;
                    var ire = new RegExp(imgRegex);
                    if (ire.test(url.toLowerCase())){
                        var img = document.createElement("img");
                        img.src = window.URL.createObjectURL(blob);
                        sakura.data.resource[id] = img.src;
                    }
                    var vre = new RegExp(videoRegex);
                    if (vre.test(url.toLowerCase())){
                        var audio = document.createElement("audio");
                        audio.src = window.URL.createObjectURL(blob);
                        sakura.data.resource[id] = audio.src;
                    }
                    callbackFun(img);
                }else if(this.status == 404){
                    callbackFun(false);
                }
            });
            req.send();
        };
        this.getLoaded = function(){
            return this.loaded;
        };
        this.getTotal = function(){
            return this.total;
        }
    }
})(sakura || (sakura = {}));
/**
 * 将字符串转为类名，首字母大写，如loading=>Loading
 * @param className
 * @returns {Object}
 */
function get_class_name(className){
    var _className = className.substring(0,1).toUpperCase()+className.substring(1);
    return eval(_className);
};
/**
 * 控制台打印调试信息
 */
function trace() {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i - 0] = arguments[_i];
    }
    for (var i in arguments) {
        console.log(arguments[i]);
    }
};
/**
 * 将对象元素转换成字符串以作比较
 * @param obj
 * @param keys
 * @returns {string}
 * @private
 */
var _obj2key = function(obj, keys){
    var n = keys.length,
        key = [];
    while(n--){
        key.push(obj[keys[n]]);
    }
    return key.join('|');
};
/**
 * 去重操作
 * @param array
 * @param keys
 * @returns {Array}
 */
function uniqe_by_keys(array, keys){
    var arr = [];
    var hash = {};
    for (var i = 0, j = array.length; i < j; i++) {
        var k = _obj2key(array[i], keys);
        if (!(k in hash)) {
            hash[k] = true;
            arr .push(array[i]);
        }
    }
    return arr ;
};
/**
* 数组去重
*/
Array.prototype.unique3 = function(){
    var res = [];
    var json = {};
    for(var i = 0; i < this.length; i++){
        if(!json[this[i]]){
            res.push(this[i]);
            json[this[i]] = 1;
        }
    }
    return res;
};
/**
* 去掉数组中的空对象
*/
Array.prototype.delEmptyObj = function(){
    var res = [];
    for(var i=0;i<this.length;i++){
        if(JSON.stringify(this[i])!='{}'){
            res.push(this[i]);
        }
    }
    return res;
}