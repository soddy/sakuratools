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