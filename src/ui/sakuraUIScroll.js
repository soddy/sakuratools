(function(sakuraUI) {
	/**
	 * [长页面scroll滚动方法]
	 * @param  {Array}  pageList    [长页面列表，可以是多个MC的集合]
	 * @param  {Object} scrollPanel [长页面外层容器，为一个MC]
	 * @param  {Number} orientation @default 0 [页面滚动的方向，1为纵向，0为横向]
	 * @return {[type]}             [description]
	 */
	sakuraUI.scroll = function(pageList, scrollPanel, orientation) {
		orientation = orientation === 1 ? 1 : 0;
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
				if(pagesTotalHeight <= scrollPanel.height){
					return;
				}
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
				if(pagesTotalWidth <= scrollPanel.width){
					return;
				}
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