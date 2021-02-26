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