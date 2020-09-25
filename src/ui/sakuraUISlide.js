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