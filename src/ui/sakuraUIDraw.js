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