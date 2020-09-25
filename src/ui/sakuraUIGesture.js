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