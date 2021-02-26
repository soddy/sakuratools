var ver = '1.0.1';
var sakuraUI;

(function(sakuraUI){
	sakuraUI.ver = ver;
})(sakuraUI || (sakuraUI = {}));
(function(sakuraUI){
	/**
     * UI截图方法，整屏截取，该方法为static
     * @param imgType {String} 截取出来的图片格式，默认为jpg，可以指定为png
     */
    sakuraUI.cutFull = function(imgType){
        var canvasW = stage.canvas.width;
        var canvasH = stage.canvas.height;

        imgType == 'png' ? imgType = 'image/png' : imgType = 'image/jpeg';
        var animation_container = document.getElementById('animation_container');
        var dpr = window.devicePixelRatio;
        var canvasTemp = document.createElement('canvas');      //重新绘制一个和屏幕一样大小的canvas
        canvasTemp.id = 'canvasTemp';
        canvasTemp.width = canvasW;     //根据屏幕内尺寸和dpr算出canvasTemp宽度
        canvasTemp.height = canvasH + parseInt(parseFloat(stage.canvas.style.top) * 2 * dpr);   //根据屏幕内尺寸和dpr算出canvasTemp高度
        canvasTemp.style.width = (parseFloat(stage.canvas.style.width) + parseFloat(stage.canvas.style.left) * 2)+'px';     //设置canvasTemp的style的宽度和高度
        canvasTemp.style.height = (parseFloat(stage.canvas.style.height) + parseFloat(stage.canvas.style.top) * 2)+'px';
        canvasTemp.style.position = 'absolute';
        canvasTemp.style.display = 'block';
        canvasTemp.style.top = '-5000px';
        animation_container.appendChild(canvasTemp);
        var contextTemp = canvasTemp.getContext('2d');
        var getImageX = Math.abs(parseFloat(stage.canvas.style.left)*dpr);
        var getImageY = Math.abs(parseFloat(stage.canvas.style.top)*dpr);
        var getImageW = stage.canvas.width - (getImageX*2);
        var getImageH = stage.canvas.height - (getImageY*2);
        var context = stage.canvas.getContext('2d');
        var imgData = context.getImageData(getImageX,getImageY,getImageW,getImageH);   //将canvas中的图像从可见屏幕范围(去掉top,left，屏幕以外的内容)复制到canvasTemp中
        contextTemp.putImageData(imgData,0,0);

        var image = canvasTemp.toDataURL(imgType);
        animation_container.removeChild(canvasTemp);
        return image;
    }
    /**
     * UI截图方法，部分屏幕截取，该方法为static
     * @param stage {Object} 从哪个stage截取
     * @param x {Float} 截取原canvas的起始x坐标
     * @param y {Float} 截取原canvas的起始y坐标
     * @param w {Float} 需要截取的原canvas图像的宽度
     * @param h {Float} 需要截取的原canvas图像的高度
     */
    sakuraUI.cutPart = function(stage, x, y, w, h, imgType){
        imgType == 'png' ? imgType = 'image/png' : imgType = 'image/jpeg';
        var dpr = window.devicePixelRatio;
        var canvasTemp = document.createElement('canvas');      //重新绘制一个和屏幕一样大小的canvas
        // canvasTemp.width = 320 / 750 * 1080;     //根据屏幕内尺寸和dpr算出canvasTemp宽度
        // canvasTemp.height = 190 / 1448 * 2085;   //根据屏幕内尺寸和dpr算出canvasTemp高度
        // canvasTemp.style.width = (320 / 750 * 1080 / 3)+'px';     //设置canvasTemp的style的宽度和高度
        // canvasTemp.style.height = (190 / 1448 * 2085 / 3)+'px';
        var viewRectW = stage.viewRect.width;
        var viewRectH = stage.viewRect.height;
        var canvasW = stage.canvas.width;
        var canvasH = stage.canvas.height;
        canvasTemp.id = 'canvasTemp';
        canvasTemp.width = w / viewRectW * canvasW;     //根据屏幕内尺寸和dpr算出canvasTemp宽度
        canvasTemp.height = h / viewRectH * canvasH;   //根据屏幕内尺寸和dpr算出canvasTemp高度
        canvasTemp.style.width = (w / viewRectW * canvasW / dpr)+'px';     //设置canvasTemp的style的宽度和高度
        canvasTemp.style.height = (h / viewRectH * canvasH / dpr)+'px';
        canvasTemp.style.position = 'absolute';
        canvasTemp.style.display = 'block';
        // canvasTemp.style.background = 'green';
        canvasTemp.style.top = '0px';
        canvasTemp.style.left = '0px';
        // canvasTemp.style.opacity = 0.5;
        document.getElementById('animation_container').appendChild(canvasTemp);

        var contextTemp = canvasTemp.getContext('2d');
        var context = stage.canvas.getContext('2d');
        // var imgData = context.getImageData(570,140,canvasTemp.width,canvasTemp.height);   //将canvas中的图像从可见屏幕范围(去掉top,left，屏幕以外的内容)复制到canvasTemp中
        // var imgData = context.getImageData(392,105,canvasTemp.width,canvasTemp.height);
        var imgData = context.getImageData(x,y,canvasTemp.width,canvasTemp.height);
        contextTemp.putImageData(imgData,0,0);
        var image = canvasTemp.toDataURL(imgType);
        canvasTemp.remove();
        return image;
    }
    /**
     * UI截图方法，手指画矩形获取要截取的图像范围，获取的坐标和宽高传递给cutPart方法
     */
    sakuraUI.cutExtent = function(){
        var self_ = this;
        //新建一个用于画截取返回的透明canvas，名为canvasExtent，克隆canvas
        if(document.getElementById('canvasExtent')){
            document.getElementById('canvasExtent').remove();
        }
        self_.x = 0;
        self_.y = 0;
        self_.w = 0;
        self_.h = 0;
        var canvasExtent = stage.canvas.cloneNode();
        canvasExtent.id = 'canvasExtent';
        canvasExtent.style['z-index'] = 100;
        document.getElementById('animation_container').appendChild(canvasExtent);

        var ctx = canvasExtent.getContext("2d");
        ctx.fillStyle = 'rgba(192,192,192,0.5)';
        ctx.fillRect(0,0,canvasExtent.width,canvasExtent.height);

        //对canvasExtent的touch事件进行监听
        canvasExtent.addEventListener('touchstart', touchStart, false);
        canvasExtent.addEventListener('touchmove', touchMove, false);
        canvasExtent.addEventListener('touchend', touchEnd, false);
        var dpr = window.devicePixelRatio;
        var startX,startY;
        var top_ = Math.abs(parseFloat(canvasExtent.style.top));
        var left_ = Math.abs(parseFloat(canvasExtent.style.left));
        function touchStart(e){
            var touch = e.touches[0];
            startX = (touch.clientX+left_)*dpr;
            startY = (touch.clientY+top_)*dpr;

            var ctx = this.getContext("2d");
            ctx.clearRect(0,0,this.width,this.height);
            ctx.fillStyle = 'rgba(192,192,192,0.5)';
            ctx.fillRect(0,0,canvasExtent.width,canvasExtent.height);
        }
        function touchMove(e){
            e.preventDefault();
            var touch = e.touches[0];
            var x = (touch.clientX+left_)*dpr;
            var y = (touch.clientY+top_)*dpr;

            var ctx = this.getContext("2d");
            ctx.lineWidth = 1;
            ctx.clearRect(0,0,this.width,this.height);
            ctx.fillStyle = 'rgba(192,192,192,0.5)';
            ctx.fillRect(0,0,canvasExtent.width,canvasExtent.height);
            ctx.beginPath();
            ctx.moveTo(startX,startY);
            ctx.lineTo(x,startY);   //上横线
            ctx.lineTo(x,y);    //右横线
            ctx.lineTo(startX,y);   //左横线
            ctx.closePath();
            ctx.stroke();
            ctx.clearRect(startX,startY,x-startX,y-startY);
        }
        function touchEnd(e){
            var touch = e.changedTouches[0];
            var endX = (touch.clientX+left_)*dpr;
            var endY = (touch.clientY+top_)*dpr;
            var w = endX - startX;
            var h = endY - startY;
            if(endX>startX && endY>startY){
                self_.x = startX;
                self_.y = startY;
            }else if(endX<startX && endY>startY){
                self_.x = endX;
                self_.y = startY;
            }else if(endX<startX && endY<startY){
                self_.x = endX;
                self_.y = endY;
            }else if(endX>startX && endY<startY){
                self_.x = startX;
                self_.y = endY;
            }
            self_.w = (Math.abs(w)*stage.viewRect.width)/this.width;
            self_.h = (Math.abs(h)*stage.viewRect.height)/this.height;
        }
        this.remove = function(){
            canvasExtent.remove();
        }
    }
    /**
     * UI截图方法，截取所需要的Mc
     */
    sakuraUI.cutMc = function(){
        //创建一个名为canvasCutMc的canvas
        if(!document.getElementById('canvasCutMc')){
            var dpr = window.devicePixelRatio;
            var canvasCutMc = document.createElement('canvas');
            canvasCutMc.id = 'canvasCutMc';
            canvasCutMc.style.position = 'absolute';
            canvasCutMc.style.display = 'block';
            document.getElementById('animation_container').appendChild(canvasCutMc);
            var stageCutMc = window.stageCutMc = new sakura.Stage('canvasCutMc', 750, 1448, 60, sakura.stageScaleMode.FIXED_BOTH, true);
        }
        return {
            loaded: function(cb){
                stageCutMc.addEventListener('loaded', function(e){
                    cb(function(){
                        return true;
                    }());
                });
            },
            cut: function(mc, imgType){
                var copyMc;
                var w = mc.nominalBounds.width;
                var h = mc.nominalBounds.height;
                mc.children.forEach(function(e, i){
                    if(mc.children[i].width == undefined){
                        copyMc = Object.create(mc.children[i].parent);
                    }else{
                        copyMc = Object.create(mc.children[i]);
                    }
                    var x = copyMc.x;
                    var y = copyMc.y;
                    copyMc.x = Math.abs(x);
                    copyMc.y = Math.abs(y);
                    stageCutMc.addChild(copyMc);
                    stageCutMc.update();
                })
                stageCutMc.update();
                var image = sakuraUI.cutPart(stageCutMc, 0, 0, w, h, imgType);
                stageCutMc.removeAllChildren();
                return image;       
            }
        }
        
    }
})(sakuraUI || (sakuraUI = {}));
(function(sakuraUI) {
    /**
     * UI画板插件，支持
     */
    sakuraUI.draw = function() {
        var self = this;
        //给stage添加不透明背景，用于捕获响应事件
        var width = stage.canvas.width;
        var height = stage.canvas.height;
        var rect = new createjs.Shape();
        rect.graphics.beginFill("#ffffff").drawRect(0, 0, width, height);
        rect.alpha = 0.01;
        stage.addChildAt(rect, 0);

        /**
         * 橡皮擦开关，设置为true时橡皮擦开启，同时绘画班功能关闭
         * @property eraserOnOff
         * @type {Boolean}
         * @default false
         **/
        self.eraserOnOff = false;

        /**
         * 绘画动作回放开关，开启后会记录绘画动作，会比较耗资源，谨慎操作
         * @property replayOnOff
         * @type {Boolean}
         * @default false
         **/
        self.replayOnOff = true;

        self._startPoint = {
            x: undefined,
            y: undefined
        };
        self._newPoint = {
            x: undefined,
            y: undefined
        };
        self._endPoint = {
            x: undefined,
            y: undefined
        };
        self._click = false; //mousedown的时候改为true,pressmove的时候查看如果是true就改为false
        self.s = []; //Shape数组
        self.eraserShape = new createjs.Shape(); //橡皮擦Shape

        self.xArr = []; //画图经过的x坐标数组
        self.yArr = []; //画图经过的y坐标数组
        self.sArr = []; //画图经过所用的时间，单位毫秒
        self.startTime = 0;
        self.endTime = 0;
        self.totalTimeStart = 0;
        self.totalTimeEnd = 0;
        self.totalTime = 0;

        var s = new createjs.Shape();

        stage.on('mousedown', function(e) {
            self._click = true;
            self._startPoint.x = e.stageX / stage.sRatio;
            self._startPoint.y = e.stageY / stage.sRatio;

            //记录点击时的开始时间
            if (self.replayOnOff) {
                self.startTime = self.totalTimeStart = Date.now();
                self.sArr.push(0);
                self.xArr.push(self._startPoint.x);
                self.yArr.push(self._startPoint.y);
            }

            if (self.eraserOnOff) {
                //橡皮擦
                self.eraserShape.graphics.beginFill("#000000");
                self.eraserShape.graphics.drawRect(self._startPoint.x - 15, self._startPoint.y - 15, 30, 30);
                self.eraserShape.graphics.endFill();
                self.eraserShape.compositeOperation = "destination-out";
                stage.addChild(self.eraserShape);
                stage.update();
            }
        });

        stage.on('pressmove', function(e) {
            self._newPoint.x = e.stageX / stage.sRatio;
            self._newPoint.y = e.stageY / stage.sRatio;

            //移动时时间差
            if (self.replayOnOff) {
                self.endTime = Date.now();
                self.sArr.push(self.endTime - self.startTime);
                self.xArr.push(self._newPoint.x);
                self.yArr.push(self._newPoint.y);
                self.startTime = Date.now();
            }

            if (self.eraserOnOff) {
                //橡皮擦
                self.eraserShape.graphics.beginFill("#000000");
                self.eraserShape.graphics.drawRect(self._newPoint.x - 15, self._newPoint.y - 15, 30, 30);
                self.eraserShape.graphics.endFill();
                self.eraserShape.compositeOperation = "destination-out";
                stage.addChild(self.eraserShape);
                stage.update();
            } else {
                if (self._click) {
                    self.s.push(new createjs.Shape());
                    self._click = false;
                }
                if (self.s.length > 0) {
                    var _s = self.s[self.s.length - 1];
                    _s.graphics.beginStroke("green");
                    _s.graphics.setStrokeStyle(5);
                    _s.graphics.moveTo(self._startPoint.x, self._startPoint.y);
                    _s.graphics.lineTo(self._newPoint.x, self._newPoint.y);
                    _s.graphics.endStroke();
                    stage.addChild(_s);
                    stage.update();
                    self._startPoint.x = self._newPoint.x;
                    self._startPoint.y = self._newPoint.y;
                }
            }
        });

        stage.on('pressup', function(e) {
            self._click = false;
            self._endPoint.x = e.stageX / stage.sRatio;
            self._endPoint.y = e.stageY / stage.sRatio;

            if (self.replayOnOff) {
                self.endTime = self.totalTimeEnd = Date.now();
                self.sArr.push(self.endTime - self.startTime);
                self.xArr.push(self._endPoint.x);
                self.yArr.push(self._endPoint.y);
                self.totalTime += (self.totalTimeEnd - self.totalTimeStart);
            }
        });

        //撤回上一步方法
        self.cancel = function() {
            if (self.s.length > 0) {
                var _s = self.s.pop();
                stage.removeChild(_s);
            }
        }
        //控制橡皮擦开关
        self.eraserControl = function() {
            self.eraserOnOff = !self.eraserOnOff;
        }
        //控制replay开关
        self.replayControl = function() {
            self.replayOnOff = !self.replayOnOff;
        }
        //获取回放时间和坐标
        self.getReplayInfo = function() {
            return {
                x: self.xArr,
                y: self.yArr,
                s: self.sArr
            }
        }
        /**
         * [replay 绘画板回放方法]
         * @param  {[Object]} info [坐标和时间信息]
         * @return {[type]}      [description]
         */
        self.replay = function(info) {
            var i = 0;
            var xArr = info.x;
            var yArr = info.y;
            var sArr = info.s;
            var step = self.totalTime / sArr.length;
            var s = new createjs.Shape();
            s.graphics.setStrokeStyle(5);
            var st = setInterval(function() {
                if (i == xArr.length) {
                    clearInterval(st);
                }
                if (sArr[i] == 0) {
                    s.graphics.beginStroke("green");
                    s.graphics.moveTo(xArr[i], yArr[i]);
                }
                if (sArr[i + 1] == 0) {
                    s.graphics.endStroke();
                } else {
                    s.graphics.lineTo(xArr[i + 1], yArr[i + 1]);
                }
                stage.addChild(s);
                stage.update();
                i++;
            }, step);
        }
    }
})(sakuraUI || (sakuraUI = {}));
(function(sakuraUI) {
    /**
     * UI手势方法，拖动，旋转，缩放
     * 1.如果actionMc==aniMc，可以拖动，旋转，缩放
     * 2.如果actionMc!=aniMc，只能做旋转，缩放
     * @param actionMc {String} 要操作的Mc，在哪个Mc上进行手势操作
     * @param aniMc {String} 执行拖动，旋转，缩放的Mc
     * @param type {Number} 0,支持拖动，旋转，缩放(actionMc!=aniMc拖动无效)，1,只拖动(actionMc==aniMc才有效)，2,只旋转，3,只缩放
     * @param {Boolean} [touchArea] [自动添加触摸区域的背景，解决透明区域无法执行事件的问题，默认为false，不添加，只针对Stage和Mc有效果]
     */
    sakuraUI.gesture = function(actMc, aniMc, type, touchArea) {
        touchArea = touchArea || false;
        var self = this;
        var _activeFingers = 0;
        var _fingers = [];
        var _dragFlag = false;
        var _rotatingFlag = false;
        var _scaleFlag = false;
        var _aniMc = {};

        if (touchArea) {
            if (actMc.canvas) {
                //stage
                var width = actMc.canvas.width;
                var height = actMc.canvas.height;
                var rect = new createjs.Shape();
                rect.graphics.beginFill("#ffffff").drawRect(0, 0, width, height);
                rect.alpha = 0.01;
                stage.addChildAt(rect, 0);
            } else {
                //mc
                var width = actMc.width;
                var height = actMc.height;
                var rect = new createjs.Shape();
                rect.graphics.beginFill("#ffffff").drawRect(0, 0, width, height);
                rect.alpha = 0.01;
                rect.x = actMc.nominalBounds.x;
                rect.y = actMc.nominalBounds.y;
                actMc.addChildAt(rect, 0);
            }
        }
        if (actMc == aniMc) {
            switch (type) {
                case 0:
                    _dragFlag = true;
                    _rotatingFlag = true;
                    _scaleFlag = true;
                    break;
                case 1:
                    _dragFlag = true;
                    break;
                case 2:
                    _rotatingFlag = true;
                    break;
                case 3:
                    _scaleFlag = true;
                    break;
            }
        } else {
            switch (type) {
                case 0:
                    _rotatingFlag = true;
                    _scaleFlag = true;
                    break;
                case 2:
                    _rotatingFlag = true;
                    break;
                case 3:
                    _scaleFlag = true;
                    break;
            }
        }

        actMc.on('mousedown', function(e) {
            _fingers[e.pointerID] = {
                start: {
                    x: e.stageX,
                    y: e.stageY
                },
                current: {
                    x: e.stageX,
                    y: e.stageY
                },
                old: {
                    x: e.stageX,
                    y: e.stageY
                }
            };
            _calculateActiveFingers();

            if (_activeFingers == 1) {
                _aniMc.x = aniMc.x;
                _aniMc.y = aniMc.y;
                _aniMc.rotation = aniMc.rotation;
                _aniMc.scaleX = aniMc.scaleX;
            }
        });
        actMc.on('pressmove', function(e) {
            _fingers[e.pointerID].current.x = e.stageX;
            _fingers[e.pointerID].current.y = e.stageY;

            _calculateActiveFingers();
            if (_activeFingers == 1) {
                if (_dragFlag) {
                    _drag();
                }
            } else {
                if (_rotatingFlag) {
                    _rotating();
                }
                if (_scaleFlag) {
                    _scale();
                }
            }
        });
        actMc.on('pressup', function(e) {
            if (_fingers[e.pointerID]) {
                delete(_fingers[e.pointerID]);
            };

            _calculateActiveFingers();

            if (_activeFingers == 0) {
                _aniMc.x = aniMc.x;
                _aniMc.y = aniMc.y;
                _aniMc.rotation = aniMc.rotation;
                _aniMc.scaleX = aniMc.scaleX;
            }
        });

        function _calculateActiveFingers() {
            _activeFingers = 0;

            for (var pointerID in _fingers) {
                if (_fingers[pointerID].start) {
                    _activeFingers++;
                }
            }
        }

        function _drag() {
            var points = [];
            for (var k in _fingers) {
                if (_fingers[k].current) {
                    points.push(_fingers[k]);
                    if (points.length >= 1) {
                        break;
                    }
                }
            }
            aniMc.x = _aniMc.x + (points[0].current.x - points[0].old.x) / stage.sRatio;
            aniMc.y = _aniMc.y + (points[0].current.y - points[0].old.y) / stage.sRatio;
        }

        function _rotating() {
            var points = [];
            for (var k in _fingers) {
                if (_fingers[k].current) {
                    points.push(_fingers[k]);
                    if (points.length >= 2) {
                        break;
                    }
                }
            }
            var point1 = points[0].old;
            var point2 = points[1].old;
            var startAngle = Math.atan2((point1.y - point2.y), (point1.x - point2.x)) * (180 / Math.PI);

            var point1 = points[0].current;
            var point2 = points[1].current;
            var currentAngle = Math.atan2((point1.y - point2.y), (point1.x - point2.x)) * (180 / Math.PI);

            aniMc.rotation = _aniMc.rotation + (currentAngle - startAngle);
        }

        function _scale() {
            var points = [];
            for (var k in _fingers) {
                if (_fingers[k].current) {
                    points.push(_fingers[k]);
                    if (points.length >= 2) {
                        break;
                    }
                }
            }
            var scale = _getDistance(points[0].current, points[1].current) / _getDistance(points[0].old, points[1].old);

            aniMc.scaleX = _aniMc.scaleX + scale - 1;
            aniMc.scaleY = aniMc.scaleX;
        }

        function _getDistance(p1, p2) {
            var x = p2.x - p1.x;
            var y = p2.y - p1.y;

            return Math.sqrt((x * x) + (y * y));
        };
    }
})(sakuraUI || (sakuraUI = {}));
(function(sakuraUI) {
	/**
	 * [长页面scroll滚动方法]
	 * @param  {Array}  pageList    [长页面列表，可以是多个MC的集合]
	 * @param  {Object} scrollPanel [长页面外层容器，为一个MC]
	 * @param  {Number} orientation @default 0 [页面滚动的方向，1为纵向，0为横向]
	 * @return {[type]}             [description]
	 */
	sakuraUI.scroll = function(pageList, scrollPanel, orientation) {
		orientation = orientation || 1;
		var self = this;
		/**
		 * 加速度的倍值，该值越大手指松开后页面滚动的越多，建议10-15之间
		 * @property speedAddValue
		 * @type {Number}
		 * @default 10
		 **/
		self.speedAddValue = 10;
		/**
		 * 缓动的倍值，该值越大手指松开后页面滚动缓动时间越长，建议0.9-0.99之间
		 * @property stepAddValue
		 * @type {Number}
		 * @default 0.95
		 **/
		self.stepAddValue = 0.95;
		/**
		 * 滚动条状态，显示或者隐藏，默认为显示
		 * @property scrollbarFlag
		 * @type {Boolean}
		 * @default true
		 */
		self.scrollbarFlag = true;

		self.init = function() {
			var radius = 8;
			var scrollbarContainer = new createjs.Container();
			var scrollbarShape = new createjs.Shape();
			var scrollOffset;
			var scrollHeight = 116;
			var scrollWidth = 116;
			if (orientation == 1) {
				//纵向滚动条====================================
				scrollbarShape.graphics.beginFill("#000000").drawCircle(0, 0, radius); //画一个半径为8，直径为16的圆
				scrollbarShape.graphics.drawRect(-radius, 0, radius * 2, 100); //画一个宽16，高100的长方形，x轴向左移动8和圆对齐
				scrollbarShape.graphics.drawCircle(0, 100, radius); //再画一个半径为8，直径为16的圆，y轴向下移动100和长方形底对齐
				scrollbarContainer.addChild(scrollbarShape);
				scrollbarContainer.alpha = 0; //滚动条的透明度为0.5
				scrollbarContainer.x = scrollPanel.width - radius; //滚动条靠长页面容器的右对齐
				scrollbarContainer.y = radius; //向下偏移8，和长页面容器的顶对齐
				scrollOffset = scrollPanel.height - scrollHeight; //滚动条走动的距离
			} else {
				//横向滚动条
				scrollbarShape.graphics.beginFill("#000000").drawCircle(0, 0, radius); //画一个半径为8，直径为16的圆
				scrollbarShape.graphics.drawRect(0, -radius, 100, radius * 2); //画一个宽100，高16的长方形，y轴向左移动8和圆对齐
				scrollbarShape.graphics.drawCircle(100, 0, radius); //再画一个半径为8，直径为16的圆，x轴向右移动100和长方形右对齐
				scrollbarContainer.addChild(scrollbarShape);
				scrollbarContainer.alpha = 0; //滚动条的透明度为0.5
				scrollbarContainer.x = radius; //滚动条靠长页面容器的左对齐
				scrollbarContainer.y = scrollPanel.height - radius; //向上偏移8，和长页面容器的底对齐
				scrollOffset = scrollPanel.width - scrollWidth; //滚动条走动的距离
			}

			var container = new createjs.Container(); //定义一个放长页面的容器
			var pagesTotalHeight = 0; //长页面的总高度
			var pagesTotalWidth = 0; //长页面的总宽度，横向时用
			for (var i = 0; i < pageList.length; i++) {
				if (orientation == 1) {
					pageList[i].x = Math.abs(pageList[i].width / 2);
					pageList[i].y = Math.abs(pageList[i].height / 2) + pagesTotalHeight;
					pagesTotalHeight += pageList[i].height;
				} else {
					pageList[i].x = Math.abs(pageList[i].width / 2) + pagesTotalWidth;
					pageList[i].y = Math.abs(pageList[i].height / 2);
					pagesTotalWidth += pageList[i].width;
				}
				container.addChild(pageList[i]);
			}

			var maskShape = new createjs.Shape(); //定义一个遮罩层
			maskShape.graphics.rect(0, 0, scrollPanel.width, scrollPanel.height).closePath(); //设置遮罩层的宽高
			container.mask = maskShape;
			scrollPanel.addChild(maskShape, container);
			if (self.scrollbarFlag) {
				scrollPanel.addChild(scrollbarContainer); //纵向滚动条
			}
			stage.addChild(scrollPanel);

			var st; //定时器
			var startPointX = 0;
			var startPointY = 0; //mousedown的时候的手指y坐标
			var prePointX = 0;
			var prePointY = 0; //上一次的手指y坐标
			var nowPointX = 0;
			var nowPointY = 0; //pressmove时当时的y坐标
			var containerX = 0;
			var containerY = 0; //滑动页面的外层容器的y坐标，每次都要加上这个值，保证滑动页面的偏移量始终在容器中
			var startTime = 0; //mousedown的时候的时间
			var direction = undefined; //向上滑动还是向下滑动，0向上，1向下，如果是横向，0向左，1向右

			var speed = 0; //手指移动的加速度
			var xOffset = 0;
			var yOffset = 0; //这次的y坐标和上一次的y坐标的差值，用于计算加速度的分子
			var useTime = 0; //这次的y坐标和上一次y坐标的用时差，用于计算加速度的分母
			var springback = false; //触发回弹，该值为true时，执行回弹

			if (orientation == 1) {
				_vertical();
			} else {
				_horizontal();
			}

			function _vertical() {
				var yLimit = scrollPanel.height - pagesTotalHeight; //需要滑动的页面y坐标可到的极限，用于控制上拉下拉的回弹
				scrollPanel.on('mousedown', function(e) {
					startTime = Date.now();
					startPointY = prePointY = e.stageY / stage.sRatio;
					containerY = container.y;
					clearInterval(st);
				});
				scrollPanel.on('pressmove', function(e) {
					springback = false;
					nowPointY = e.stageY / stage.sRatio;
					yOffset = Math.abs(nowPointY - prePointY); //这次的y坐标减去上次的y坐标，然后将这次的y坐标赋值给上一次
					useTime = Date.now() - startTime; //当前的时间(毫秒)减去上次的时间(毫秒)，得到这次滑动的用时
					speed = yOffset / useTime; //滑动时的加速度，根据这个加速度来判断是拖动还是滑动
					startTime = Date.now(); //将当前的时间赋值给上次的时间

					if (nowPointY != prePointY) {
						if (nowPointY < prePointY) {
							//up
							direction = 0;
						} else {
							//down
							direction = 1;
						}
					}
					prePointY = nowPointY; //将这次的y坐标赋值给上一次

					container.y = containerY + ((e.stageY / stage.sRatio) - startPointY); //拖动
					createjs.Tween.get(scrollbarContainer).to({
						alpha: 0.5
					}, 10);

					//滚动条
					scrollbarContainer.y = radius + Math.abs(container.y * scrollOffset / Math.abs(yLimit));

					if (nowPointY - startPointY < 0) {
						//向上拖动的时候，底部弹动缓冲
						if (container.y <= yLimit) {
							container.y = yLimit + (container.y - yLimit) * 0.2;
							//滚动条
							scrollbarContainer.y = (scrollPanel.height - scrollHeight + radius) + (container.y - yLimit);
							springback = true;
						}
					} else {
						//向下拖动的时候，顶部弹动缓冲
						if (container.y >= 0) {
							container.y *= 0.2;
							//滚动条
							scrollbarContainer.y = radius + container.y;
							springback = true;
						}
					}
				});
				scrollPanel.on('pressup', function(e) {
					var step = speed * self.speedAddValue;
					if (springback) {
						if (container.y >= 0) {
							//向上回弹到顶部
							createjs.Tween.get(scrollbarContainer).wait(500).to({
								alpha: 0
							}, 10);
							st = setInterval(function() {
								container.y -= 10;
								//滚动条
								scrollbarContainer.y = radius + container.y;
								if (container.y <= 0) {
									container.y = 0;
									//滚动条
									scrollbarContainer.y = radius + container.y;
									clearInterval(st);
								}
							}, 10);
						}
						if (container.y <= yLimit) {
							//向下回弹到底部
							createjs.Tween.get(scrollbarContainer).wait(500).to({
								alpha: 0
							}, 10);
							st = setInterval(function() {
								container.y += 10;
								//滚动条
								scrollbarContainer.y = scrollPanel.height - scrollHeight + radius;
								if (container.y <= (yLimit + 15)) {
									container.y = yLimit;
									//滚动条
									scrollbarContainer.y = scrollPanel.height - scrollHeight + radius;
									clearInterval(st);
								}
								clearInterval(st);
							}, 10);
						}
					} else {
						if (direction == 0) {
							createjs.Tween.get(scrollbarContainer).wait(1000).to({
								alpha: 0
							}, 10);
							st = setInterval(function() {
								container.y -= step;
								//滚动条
								scrollbarContainer.y = radius + Math.abs(container.y * scrollOffset / Math.abs(yLimit));
								if (container.y <= yLimit) {
									container.y = yLimit;
									//滚动条
									scrollbarContainer.y = radius + Math.abs(container.y * scrollOffset / Math.abs(yLimit));
									clearInterval(st);
								}
								step *= self.stepAddValue;
								if (step < 0.001) {
									clearInterval(st);
								}
							}, 10);
						} else {
							createjs.Tween.get(scrollbarContainer).wait(1000).to({
								alpha: 0
							}, 10);
							st = setInterval(function() {
								container.y += step;
								scrollbarContainer.y = radius + Math.abs(container.y * scrollOffset / Math.abs(yLimit));
								if (container.y >= 0) {
									container.y = 0;
									clearInterval(st);
								}
								step *= self.stepAddValue;
								if (step < 0.001) {
									clearInterval(st);
								}
							}, 10);
						}
					}
				});
			}

			function _horizontal() {
				var xLimit = scrollPanel.width - pagesTotalWidth; //需要滑动的页面y坐标可到的极限，用于控制上拉下拉的回弹
				scrollPanel.on('mousedown', function(e) {
					startTime = Date.now();
					startPointX = prePointX = e.stageX / stage.sRatio;
					containerX = container.x;
					clearInterval(st);
				});
				scrollPanel.on('pressmove', function(e) {
					springback = false;
					nowPointX = e.stageX / stage.sRatio;
					xOffset = Math.abs(nowPointX - prePointX); //这次的y坐标减去上次的y坐标，然后将这次的y坐标赋值给上一次
					useTime = Date.now() - startTime; //当前的时间(毫秒)减去上次的时间(毫秒)，得到这次滑动的用时
					speed = xOffset / useTime; //滑动时的加速度，根据这个加速度来判断是拖动还是滑动
					startTime = Date.now(); //将当前的时间赋值给上次的时间

					if (nowPointX != prePointX) {
						if (nowPointX < prePointX) {
							//left
							direction = 0;
						} else {
							//right
							direction = 1;
						}
					}

					prePointX = nowPointX; //将这次的y坐标赋值给上一次

					container.x = containerX + ((e.stageX / stage.sRatio) - startPointX); //拖动
					createjs.Tween.get(scrollbarContainer).to({
						alpha: 0.5
					}, 10);

					//滚动条
					scrollbarContainer.x = radius + Math.abs(container.x * scrollOffset / Math.abs(xLimit));

					if (nowPointX - startPointX < 0) {
						//向左拖动的时候，右部弹动缓冲
						if (container.x <= xLimit) {
							container.x = xLimit + (container.x - xLimit) * 0.2;
							//滚动条
							scrollbarContainer.x = (scrollPanel.width - scrollWidth + radius) + (container.x - xLimit);
							springback = true;
						}
					} else {
						//向右拖动的时候，左部弹动缓冲
						if (container.x >= 0) {
							container.x *= 0.2;
							//滚动条
							scrollbarContainer.x = radius + container.x;
							springback = true;
						}
					}
				});
				scrollPanel.on('pressup', function(e) {
					var step = speed * self.speedAddValue;
					if (springback) {
						if (container.x >= 0) {
							//向左回弹到顶部
							createjs.Tween.get(scrollbarContainer).wait(500).to({
								alpha: 0
							}, 10);
							st = setInterval(function() {
								container.x -= 10;
								//滚动条
								scrollbarContainer.x = radius + container.x;
								if (container.x <= 0) {
									container.x = 0;
									//滚动条
									scrollbarContainer.x = radius + container.x;
									clearInterval(st);
								}
							}, 10);
						}
						if (container.x <= xLimit) {
							//向右回弹到底部
							createjs.Tween.get(scrollbarContainer).wait(500).to({
								alpha: 0
							}, 10);
							st = setInterval(function() {
								container.x += 10;
								//滚动条
								scrollbarContainer.x = scrollPanel.width - scrollWidth + radius;
								if (container.x <= (xLimit + 15)) {
									container.x = xLimit;
									//滚动条
									scrollbarContainer.x = scrollPanel.width - scrollWidth + radius;
									clearInterval(st);
								}
								clearInterval(st);
							}, 10);
						}
					} else {
						if (direction == 0) {
							createjs.Tween.get(scrollbarContainer).wait(1000).to({
								alpha: 0
							}, 10);
							st = setInterval(function() {
								container.x -= step;
								//滚动条
								scrollbarContainer.x = radius + Math.abs(container.x * scrollOffset / Math.abs(xLimit));
								if (container.x <= xLimit) {
									container.x = xLimit;
									//滚动条
									scrollbarContainer.x = radius + Math.abs(container.x * scrollOffset / Math.abs(xLimit));
									clearInterval(st);
								}
								step *= self.stepAddValue;
								if (step < 0.001) {
									clearInterval(st);
								}
							}, 10);
						} else {
							createjs.Tween.get(scrollbarContainer).wait(1000).to({
								alpha: 0
							}, 10);
							st = setInterval(function() {
								container.x += step;
								scrollbarContainer.x = radius + Math.abs(container.x * scrollOffset / Math.abs(xLimit));
								if (container.x >= 0) {
									container.x = 0;
									clearInterval(st);
								}
								step *= self.stepAddValue;
								if (step < 0.001) {
									clearInterval(st);
								}
							}, 10);
						}
					}
				});
			}
		}
	}
})(sakuraUI || (sakuraUI = {}));
(function(sakuraUI) {
	sakuraUI.slide = function(pageList, slidePanel, orientation) {
		orientation = orientation || 1;
		var self = this;
		//如果是循环滑动，加载的时候将最后一页添加到第一页前面拼接起来
		//第一页滑动过去以后，显示第二页，第二页滑动过去以后，显示第三页，同时将第一页的拼接到第三页下面
		self.init = function(cb) {
			var container = new createjs.Container(); //定义一个放长页面的容器
			var pagesTotalHeight = 0; //长页面的总高度
			var pagesTotalWidth = 0; //长页面的总宽度，横向时用
			for (var i = 0; i < pageList.length; i++) {
				if (orientation == 1) {
					pageList[i].x = Math.abs(pageList[i].width / 2);
					pageList[i].y = Math.abs(pageList[i].height / 2) + pagesTotalHeight;
					pagesTotalHeight += pageList[i].height;
				} else {
					pageList[i].x = Math.abs(pageList[i].width / 2) + pagesTotalWidth;
					pageList[i].y = Math.abs(pageList[i].height / 2);
					pagesTotalWidth += pageList[i].width;
				}
				container.addChild(pageList[i]);
			}

			var maskShape = new createjs.Shape(); //定义一个遮罩层
			maskShape.graphics.rect(0, 0, slidePanel.width, slidePanel.height).closePath(); //设置遮罩层的宽高
			container.mask = maskShape;
			slidePanel.addChild(maskShape, container);
			stage.addChild(slidePanel);

			var st; //定时器
			var startPointX = 0;
			var startPointY = 0; //mousedown的时候的手指y坐标
			var prePointX = 0;
			var prePointY = 0; //上一次的手指y坐标
			var nowPointX = 0;
			var nowPointY = 0; //pressmove时当时的y坐标
			var containerX = 0;
			var containerY = 0; //滑动页面的外层容器的y坐标，每次都要加上这个值，保证滑动页面的偏移量始终在容器中
			var startTime = 0; //mousedown的时候的时间
			var direction = undefined; //向上滑动还是向下滑动，0向上，1向下，如果是横向，0向左，1向右

			var speed = 0; //手指移动的加速度
			var xOffset = 0;
			var yOffset = 0; //这次的y坐标和上一次的y坐标的差值，用于计算加速度的分子
			var useTime = 0; //这次的y坐标和上一次y坐标的用时差，用于计算加速度的分母
			// var springback = false; //触发回弹，该值为true时，执行回弹
			var nowPage = 1; //现在显示的是第几页
			var slideLimit = orientation == 1 ? slidePanel.height / 2 : slidePanel.width / 2; //手指滑动致使页面运动到下一页的界限值，为slidePanel的一半高度或者宽度
			var slidePanelUpLimit = slidePanel.y - slidePanel.regY; //slidePanel上边界
			var slidePanelDownLimit = slidePanel.y + slidePanel.regY; //slidePanel下边界
			var slidePanelLeftLimit = slidePanel.x - slidePanel.regX;	//slidePanel左边界
			var slidePanelRightLimit = slidePanel.x + slidePanel.regX;	//slidePanel右边界
			var pressLock = false;

			if (orientation == 1) {
				_vertical();
			} else {
				_horizontal();
			}

			cb(function(){
				return nowPage;
			}());
			
			function _vertical() {
				var yLimit = slidePanel.height - pagesTotalHeight;
				slidePanel.on('mousedown', function(e) {
					if(pressLock){
						return;
					}
					startTime = Date.now();
					startPointY = prePointY = e.stageY / stage.sRatio;
					containerY = container.y;
					clearInterval(st);
				});
				slidePanel.on('pressmove', function(e) {
					// springback = false;
					if(pressLock){
						return;
					}
					nowPointY = e.stageY / stage.sRatio;
					yOffset = Math.abs(nowPointY - prePointY); //这次的y坐标减去上次的y坐标，然后将这次的y坐标赋值给上一次
					useTime = Date.now() - startTime; //当前的时间(毫秒)减去上次的时间(毫秒)，得到这次滑动的用时
					speed = yOffset / useTime; //滑动时的加速度，根据这个加速度来判断是拖动还是滑动
					startTime = Date.now(); //将当前的时间赋值给上次的时间

					if (nowPointY != prePointY) {
						if (nowPointY < prePointY) {
							//up
							direction = 0;
						} else {
							//down
							direction = 1;
						}
					}
					prePointY = nowPointY; //将这次的y坐标赋值给上一次

					//超过上下边界停止拖动
					if (nowPointY < slidePanelUpLimit || nowPointY > slidePanelDownLimit) {
						return;
					}
					container.y = containerY + ((e.stageY / stage.sRatio) - startPointY); //拖动

					if (nowPointY - startPointY < 0) {
						//向上拖动的时候，底部弹动缓冲
						if (container.y <= yLimit) {
							// springback = true;
							container.y = yLimit;
						}
					} else {
						//向下拖动的时候，顶部弹动缓冲
						if (container.y >= 0) {
							// springback = true;
							container.y = 0;
						}
					}
				});
				slidePanel.on('pressup', function(e) {
					if(pressLock){
						return;
					}
					pressLock = true;
					if (speed < 0.3) {
						//拖动
						if(container.y > -(slideLimit+((nowPage-1)*slidePanel.height))){
							createjs.Tween.get(container).to({
								y: -((nowPage-1)*slidePanel.height)
							}, 150).call(function() {
								pressLock = false;
								nowPage--;
								if(nowPage < 1){
									nowPage = 1;
								}
								cb(function(){
									return nowPage;
								}());
							});
						}else{
							createjs.Tween.get(container).to({
								y: -(nowPage*slidePanel.height)
							}, 150).call(function() {
								pressLock = false;
								nowPage++;
								if(nowPage > pageList.length){
									nowPage = pageList.length;
								}
								cb(function(){
									return nowPage;
								}());
							});
						}
					} else {
						if (direction == 0) {
							if(nowPage == pageList.length){
								pressLock = false;
								return;
							}
							createjs.Tween.get(container).to({
								y: -(nowPage*slidePanel.height)
							}, 150).call(function() {
								pressLock = false;
								nowPage++;
								if(nowPage > pageList.length){
									nowPage = pageList.length;
								}
								cb(function(){
									return nowPage;
								}());
							});
						}else{
							if(nowPage == 1){
								pressLock = false;
								return;
							}
							createjs.Tween.get(container).to({
								y: -((nowPage-2)*slidePanel.height)
							}, 150).call(function() {
								pressLock = false;
								nowPage--;
								if(nowPage < 1){
									nowPage = 1;
								}
								cb(function(){
									return nowPage;
								}());
							});
						}
					}
				});
			}

			function _horizontal(){
				var xLimit = slidePanel.width - pagesTotalWidth;
				slidePanel.on('mousedown', function(e) {
					if(pressLock){
						return;
					}
					startTime = Date.now();
					startPointX = prePointX = e.stageX / stage.sRatio;
					containerX = container.x;
					clearInterval(st);
				});
				slidePanel.on('pressmove', function(e) {
					if(pressLock){
						return;
					}
					nowPointX = e.stageX / stage.sRatio;
					xOffset = Math.abs(nowPointX - prePointX); //这次的x坐标减去上次的x坐标，然后将这次的x坐标赋值给上一次
					useTime = Date.now() - startTime; //当前的时间(毫秒)减去上次的时间(毫秒)，得到这次滑动的用时
					speed = xOffset / useTime; //滑动时的加速度，根据这个加速度来判断是拖动还是滑动
					startTime = Date.now(); //将当前的时间赋值给上次的时间

					if (nowPointX != prePointX) {
						if (nowPointX < prePointX) {
							//left
							direction = 0;
						} else {
							//right
							direction = 1;
						}
					}
					prePointX = nowPointX; //将这次的x坐标赋值给上一次

					//超过左右边界停止拖动
					if (nowPointX < slidePanelLeftLimit || nowPointX > slidePanelRightLimit) {
						return;
					}
					container.x = containerX + ((e.stageX / stage.sRatio) - startPointX); //拖动

					if (nowPointX - startPointX < 0) {
						//向左拖动的时候
						if (container.x <= xLimit) {
							container.x = xLimit;
						}
					} else {
						//向右拖动的时候
						if (container.x >= 0) {
							container.x = 0;
						}
					}
				});
				slidePanel.on('pressup', function(e) {
					if(pressLock){
						return;
					}
					pressLock = true;
					if (speed < 0.3) {
						//拖动
						if(container.x > -(slideLimit+((nowPage-1)*slidePanel.width))){
							createjs.Tween.get(container).to({
								x: -((nowPage-1)*slidePanel.width)
							}, 150).call(function() {
								pressLock = false;
								nowPage--;
								if(nowPage < 1){
									nowPage = 1;
								}
								cb(function(){
									return nowPage;
								}());
							});
						}else{
							createjs.Tween.get(container).to({
								x: -(nowPage*slidePanel.width)
							}, 150).call(function() {
								pressLock = false;
								nowPage++;
								if(nowPage > pageList.length){
									nowPage = pageList.length;
								}
								cb(function(){
									return nowPage;
								}());
							});
						}
					} else {
						if (direction == 0) {
							if(nowPage == pageList.length){
								pressLock = false;
								return;
							}
							createjs.Tween.get(container).to({
								x: -(nowPage*slidePanel.width)
							}, 150).call(function() {
								pressLock = false;
								nowPage++;
								if(nowPage > pageList.length){
									nowPage = pageList.length;
								}
								cb(function(){
									return nowPage;
								}());
							});
						}else{
							if(nowPage == 1){
								pressLock = false;
								return;
							}
							createjs.Tween.get(container).to({
								x: -((nowPage-2)*slidePanel.width)
							}, 150).call(function() {
								pressLock = false;
								nowPage--;
								if(nowPage < 1){
									nowPage = 1;
								}
								cb(function(){
									return nowPage;
								}());
							});
						}
					}
				});
			}
		}
	}
})(sakuraUI || (sakuraUI = {}));
(function(sakuraUI) {
	sakuraUI.video = function(obj) {
		_url = obj.url;	//必填
		_type = obj.type === undefined ? 1 : obj.type;	//1为直接播放视频，2为播放帧动画
		_scale = obj.scale === undefined ? 1 : obj.scale;	//canvas播放比例，默认为1
		_time = obj.time === undefined ? 0.1 : obj.time;	//每次播放多少秒，默认为0.1
		_totalTime = obj.totalTime === undefined ? 0 : obj.totalTime;	//视频总时长，必须填写
		var random = (new Date()).valueOf();
		//先创建一个video标签
		var video = document.createElement('video');
		video.setAttribute('id','video'+random);	//这里的id后面需要用随机数来代替
		video.setAttribute('muted', '');
		video.setAttribute('webkit-playsinline', true);
		video.setAttribute('playsinline', true);
		video.setAttribute('preload', true);
		video.setAttribute('x5-video-player-type', 'h5-page');
		video.setAttribute('style', 'width:100%; position:absolute; z-index:1; display:none;');
		video.src = _url;
		document.body.append(video);

		//再创建一个canvas标签
		var canvasW = stage.canvas.width;
    	var canvasH = stage.canvas.height;
		var animation_container = document.getElementById('animation_container');
        var dpr = window.devicePixelRatio;
        var videoCanvas = document.createElement('canvas');      //重新绘制一个和屏幕一样大小的canvas
        videoCanvas.id = 'video'+random+'Canvas';
        videoCanvas.width = canvasW;     //根据屏幕内尺寸和dpr算出canvasTemp宽度
        videoCanvas.height = canvasH + parseInt(parseFloat(stage.canvas.style.top) * 2 * dpr);   //根据屏幕内尺寸和dpr算出canvasTemp高度
        videoCanvas.style.width = (parseFloat(stage.canvas.style.width) + parseFloat(stage.canvas.style.left) * 2)+'px';     //设置canvasTemp的style的宽度和高度
        videoCanvas.style.height = (parseFloat(stage.canvas.style.height) + parseFloat(stage.canvas.style.top) * 2)+'px';
        videoCanvas.style.position = 'absolute';
        animation_container.appendChild(videoCanvas);

        this.videoTemp = video;
        this.videoCanvas = videoCanvas;
        this.ctx = videoCanvas.getContext('2d');

        var currentTime = 0;

		this.onPlay = function(){
			if(_type != 1){
				return;
			}
			this.videoTemp.play();
			stage.autoClear = false;
			var bitmap = new createjs.Bitmap(this.videoTemp);
            stage.addChild(bitmap);
            bitmap.scaleX = _scale;
            bitmap.scaleY = _scale;
		}
		this.onPlayFrames = function(){
			if(_type != 2){
				return;
			}
			if(currentTime < _totalTime){
				this.videoTemp.play();
	        	this.videoTemp.pause();
	        	currentTime+=_time;
	            this.videoTemp.currentTime = currentTime;
	            this.ctx.drawImage(this.videoTemp, 0, 0, canvasW*_scale, canvasH*_scale);
            }
		}
	}
})(sakuraUI || (sakuraUI = {}));