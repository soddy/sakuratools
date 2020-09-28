# sakura tools

#### 介绍
1.  利用animate cc导出动画到h5工具，核心利用的是create.js，对原始导出的动画js文件进行分析，替换成sakura.js可用的新的js动画文件
2.  生成音频分割文件，提供给howler.js使用

#### 版本说明
工具版本：1.0.0

核心引擎版本：1.0.0

UI版本：1.0.0

#### 工具版本更新说明

#### 核心引擎版本更新说明

#### UI版本更新说明

#### 使用说明

1.  npm install	安装工具所需依赖
2.  npm start	启动工具，监听animate cc动画文件变化
3.  npm run new	创建新的项目
4.  npm run buildaudio	分割压缩音频文件，提供给howler.js使用，压缩地址为项目目录src/resource/sounds/，压缩到项目目录src/resource/sounds/dist

#### 工具目录说明
├─sakuratools
│  │  gulpfile.js  分割音频文件gulp使用的配置文件
│  │  newproject.js  生成新项目的nodejs文件
│  │  start.js  工具主文件，用于监听动画文件变化的nodejs文件
│  │  
│  ├─dist  核心引擎和UI的打包和压缩文件目录
│  ├─src  核心引擎和UI为打包的文件
│  │  ├─core
│  │  └─ui
│  └─template  生成新项目的模板文件
│      │  index.html
│      ├─js
│      │      main.js
│      │      templateClass.tpl
│      └─libs
│              createjs.min.js
│              howler.min.js
│              resource.js
│              sakuraCore.min.js
│              sakuraUI.min.js
│              vconsole.min.js

#### 整个项目目录
-projectDir			项目目录
	-sakuratools	sakura工具目录
	-animate		动画文件夹，里面存放的是fla动画文件
		-images		动画导出的图片文件
		-resource	动画图片源文件
	-src 			项目开发目录
		-animatejs	通过sakuratools start监听动画js文件变化后导出到开发目录的js动画文件都放在这个目录，这个目录中的文件不要去修改
		-js			开发js目录，主要开发文件在该目录
			-lib	js库文件地址，如create.js，sakura.js，howler.js文件等
		-resource	h5所需的资源文件都放在这个文件夹
			-images	动画导出的图片文件
			-sounds	howler.js所需的音频文件
			-video	视频文件夹

#### 小贴士
1.   开发时基本都是在src/js/ 文件夹下的js文件中开发，main.js为入口文件，loading之类的可以在这个文件。
2.   src/js 文件夹下的class文件就是每个对应的动画js的逻辑文件。