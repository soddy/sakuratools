# sakura tools

#### 介绍
1.  利用animate cc导出动画到h5工具，核心利用的是create.js，对原始导出的动画js文件进行分析，替换成sakura.js可用的新的js动画文件
2.  生成音频分割文件，提供给howler.js使用

#### 版本说明
工具版本：1.1.0<br/>
核心引擎版本：1.2.3<br/>
UI版本：1.0.2<br/>

#### 工具版本更新说明
1.1.1 修复调用资源文件路径bug，libs=>js/libs<br/>
1.1.0 在每个mc中加入了动画播放完成发送animationEnd事件

#### 核心引擎版本更新说明
1.2.3 更新vconsole的加载路径bug<br/>
1.2.2 1.更改loading加载方式，将原来js资源加载不记录progress改为js资源文件加载时也记录进度。2.将视频加载添加到load中，但不建议用，因为会将整个视频全部加载完成才算loading完成，对于大视频不建议使用，还是使用video标签在html页面加载<br/>
1.2.1 设置mc位置,mc.position.top(),left(),right(),bottom()<br/>
1.2.0 加一个调用外部资源的功能，绝对链接是cdn的

#### UI版本更新说明
1.0.2 修改UI中长页面滑动，展示list高度小于滑动区域滑动错乱的bug，改成小于后不能滑动<br/>
1.0.1 修改UI中截取MC只能截取一个图层而不能截取整个MC中所有元素的bug

#### 使用说明

1.  npm install	安装工具所需依赖
2.  npm start	启动工具，监听animate cc动画文件变化
3.  npm run new	创建新的项目
4.  npm run buildaudio	分割压缩音频文件，提供给howler.js使用，压缩地址为项目目录src/resource/sounds/，压缩到项目目录src/resource/sounds/dist

#### 工具目录说明
-sakuratools    工具文件夹<br/>
&nbsp;&nbsp;-dist		核心引擎和UI的打包和压缩文件目录<br/>
&nbsp;&nbsp;-src    	核心引擎和UI为打包的文件<br/>
&nbsp;&nbsp;-template   生成新项目的模板文件<br/>
&nbsp;&nbsp;-gulpfile.js    分割音频文件gulp使用的配置文件<br/>
&nbsp;&nbsp;-newproject.js 	生成新项目的nodejs文件<br/>
&nbsp;&nbsp;-start.js 		工具主文件，用于监听动画文件变化的nodejs文件<br/>

#### 整个项目目录
-projectDir			项目目录<br/>
&nbsp;&nbsp;-sakuratools	sakura工具目录<br/>
&nbsp;&nbsp;-animate		动画文件夹，里面存放的是fla动画文件<br/>
&nbsp;&nbsp;&nbsp;&nbsp;-images		动画导出的图片文件<br/>
&nbsp;&nbsp;&nbsp;&nbsp;-resource	动画图片源文件<br/>
&nbsp;&nbsp;-src 			项目开发目录<br/>
&nbsp;&nbsp;&nbsp;&nbsp;-animatejs	通过sakuratools start监听动画js文件变化后导出到开发目录的js动画文件都放在这个目录，这个目录中的文件不要去修改<br/>
&nbsp;&nbsp;&nbsp;&nbsp;-js			开发js目录，主要开发文件在该目录<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-lib	js库文件地址，如create.js，sakura.js，howler.js文件等<br/>
&nbsp;&nbsp;&nbsp;&nbsp;-resource	h5所需的资源文件都放在这个文件夹<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-images	动画导出的图片文件<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-sounds	howler.js所需的音频文件<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-video	视频文件夹<br/>

#### 小贴士
1.   开发时基本都是在src/js/ 文件夹下的js文件中开发，main.js为入口文件，loading之类的可以在这个文件。
2.   src/js 文件夹下的class文件就是每个对应的动画js的逻辑文件。
