//version:1.1.1
//监听animate文件夹中的文件变化，以及animate/images，animate/sounds，animate/components文件夹中文件变化
//animate文件夹中的js文件有变化，就复制到src文件夹下的animatejs文件夹中
//animate/images文件夹有变化，就复制有变化的文件到src/images文件夹中
//animate/sounds文件夹有变化，就复制有变化的文件到src/sounds文件夹中

let chokidar = require('chokidar');
let fs = require('fs');
let path = require('path');

let watcher = null;

if(!watcher){
	watcher = chokidar.watch(path.join(__dirname, '../animate'));
}
watcher.on('add', function(_path){
	handleFile(_path, 'create');
});
watcher.on('change', function(_path){
	handleFile(_path, 'update');
});

function handleFile(_path, _status){
	//判断最后一个文件夹是animate,images,sounds,components  images,sounds,components属于animate目录
	let lastFolderArr = path.dirname(_path).split(path.sep);
	let lastFolder = lastFolderArr.pop();
	if(lastFolder == 'animate'){
		//判断改变的文件是否是js文件，如果是js文件，读取js文件内容，和js的文件名，将文件名首字母大写，然后替换js文件中的所有'lib,','lib.','lib = lib'
		//替换成首字母大写的js文件名
		let ext = path.extname(_path);
		if(ext == '.js'){
			//判断js文件是否有对应的fla文件，如果没有就return,说明是非法文件
			let baseName = path.basename(_path, '.js');
			if(!fs.existsSync(path.join(path.dirname(_path), baseName+'.fla'))){
				return;
			}
			let className = get_class_name(baseName);
			fs.readFile(_path, 'utf8', function(err, data){
				if(err) throw err;
				//将lib替换为ClassName
				let replaceData = rewrite_classname(data, className);
				//将replaceData中的new Class()这样实例化的代码替换为sakura.movieClip()这样的代码
				replaceData = replace_sakuraMc(replaceData, className);
				//在每个mc最后都加入dispatchEvent,表示mc播放完毕
				replaceData = add_dispatchEvent(replaceData);
				//将replaceData中的manifest重写
				replaceData = rewrite_manifest(replaceData);
				//将替换好的字符串写入src/animatejs文件夹中
				let outputPath = path.join(__dirname, '../src/animatejs/'+ path.basename(_path) +'');
				fs.writeFile(outputPath, replaceData, 'utf8', function(err){
					if(err) throw err;
					//console.log(path.basename(_path) + ' ' + _status);
				});
			});
			//判断src中对应的Class.js文件是否存在，不存在就创建
			if(!fs.existsSync(path.join(__dirname, '../src/js/'+ baseName +'Class.js'))){
				fs.readFile('template/js/templateClass.tpl', 'utf8', function(err, data){
					if(err) throw err;
					let replaceData = data.replace(/\{Template\}/g, ''+ className +'').replace(/\{TemplateMethod\}/g, ''+ baseName +'');
					let outputPath = path.join(__dirname, '../src/js/'+ baseName +'Class.js');
					fs.writeFile(outputPath, replaceData, 'utf8', function(err){
						if(err) throw err;
						//console.log(path.join(__dirname, '../web/src/'+ baseName +'Class.js') + ' ' + _status);
					});
				});
			}
		}
	}else if(lastFolder == 'images'){
		//将images文件夹下的文件复制到src/resource/images下
		let outputPath = path.join(__dirname, '../src/resource/images/'+ path.basename(_path) +'');
		fs.copyFile(_path, outputPath, function(err){
			if(err) throw err;
			//console.log(path.basename(_path) + ' ' + _status);
		});
	}else if(lastFolder == 'sounds'){
		//将sounds文件夹下的文件复制到src/resource/sounds下
		let outputPath = path.join(__dirname, '../src/resource/sounds/'+ path.basename(_path) +'');
		fs.copyFile(_path, outputPath, function(err){
			if(err) throw err;
		})
	}else{
		if(lastFolder != 'resource'){
			let outputPath = path.join(__dirname, '../src/js/libs/'+ path.basename(_path) +'');
			fs.copyFile(_path, outputPath, function(err){
				if(err) throw err;
				//console.log(path.basename(_path) + ' ' + _status);
			});
		}
	}
}
//将lib替换为ClassName
function rewrite_classname(replaceData, className){
	replaceData = replaceData.replace(/lib\,/g, ''+ className +',').replace(/lib\./g, ''+ className +'.').replace(/lib = lib/g, ''+ className +' = '+ className +'');
	return replaceData;
}
//将replaceData中的new Class()这样实例化的代码替换为sakura.movieClip()这样的代码
function replace_sakuraMc(replaceData, className){
	let newLength = replaceData.split('new '+className+'').length - 1;
	for(let i=0;i<newLength;i++){
		let _start = find(replaceData, 'new '+className+'', i);
		let _thisStart = replaceData.lastIndexOf('this.', _start);
		let _end = replaceData.indexOf(')',_start) + 1;
		let replaceStr = replaceData.substring(_thisStart, _end);
		let _start_ = find(replaceStr, 'new '+className+'', 0);
		let _end_ = replaceStr.indexOf(')',_start_) + 1;
		let _replaceStr_ = replaceStr.substring(_start_, _end_);
		let replaceStr_ = replaceStr.replace(_replaceStr_, 'sakura.movieClip('+_replaceStr_+')');
		replaceData = replaceData.replace(replaceStr, replaceStr_);
	}
	return replaceData;
}
//manifest重写
function rewrite_manifest(replaceData){
	let _start = find(replaceData, 'manifest', 0);
	let _end = replaceData.indexOf(']',_start) + 1;
	let manifestStr = manifestReplaceStr = replaceData.substring(_start, _end);
	manifestStr = manifestStr.replace(/manifest\:/g, '').replace(/\n/g, '').replace(/\t/g, '');
	let manifestArr = eval("("+manifestStr+")");
	let newManifestArr = [];
	let newManifestObj = {};
	let jsManifestArr = [];
	let jsManifestObj = {};
	//将jquery cdn地址转为本地
	for(let i=0;i<manifestArr.length;i++){
		//如果不是js文件，重新写入资源文件的manifest
		if(manifestArr[i]['src'].indexOf('.js') == -1){
			newManifestObj['src'] = 'resource/'+manifestArr[i]['src'];
			newManifestObj['id'] = manifestArr[i]['id'];
			newManifestArr.push(newManifestObj);
			newManifestObj = {};
		}else{
			if(manifestArr[i]['src'].indexOf('jquery') > -1){
				jsManifestObj['src'] = 'js/libs/jquery.min.js';
			}else{
				jsManifestObj['src'] = 'js/libs/' + (manifestArr[i]['src'].split('/').pop()).split('?')[0];
			}
			jsManifestArr.push(jsManifestObj);
			jsManifestObj = {};
		}
	}
	if(jsManifestArr.length != 0){
		let outputPath = path.join(__dirname, '../src/js/libs/resource.js');
		let jsManifestStr = '{manifest:['+obj_arr_to_str(jsManifestArr)+']}';
		fs.writeFile(outputPath, jsManifestStr, 'utf8', function(err){
			if(err) throw err;
		});
	}
	replaceData = replaceData.replace(manifestReplaceStr, 'manifest: [' + obj_arr_to_str(newManifestArr) + ']');
	return replaceData;
}
//加入dispatchEvent
function add_dispatchEvent(replaceData){
	let replaceStr_ = `;
	var _self = this;
	this.timeline.addEventListener('change', function(){
		if(_self.currentFrame == _self.timeline.duration - 1){
			_self.dispatchEvent('animationEnd');
		}
	});
	}).prototype = p = new cjs.MovieClip();`;
	let newLength = replaceData.split('}).prototype = p = new cjs.MovieClip()').length - 1;
	for(let i=0;i<newLength;i++){
		let _start = find(replaceData, '}).prototype = p = new cjs.MovieClip()', i);
		let _thisStart = replaceData.lastIndexOf(';', _start);
		let _end = replaceData.indexOf(';',_start) + 1;
		let replaceStr = replaceData.substring(_thisStart, _end);
		replaceData = replaceData.replace(replaceStr, replaceStr_);
	}
	return replaceData;
}
//转变为首字母大写
function get_class_name(className){
	let _className = className.substring(0,1).toUpperCase()+className.substring(1);
    return _className;
}
//查找字符串出现的开始位置
function find(str,cha,num){
	let x = str.indexOf(cha);
	for(let i=0;i<num;i++){
		x = str.indexOf(cha,x+1);
	}
	return x;
}
//对象性数组转字符串
function obj_arr_to_str(arr){
	for(let i=0;i<arr.length;i++){
		let str=""
		for(let j in arr[i]){
			str+=j+":\""+arr[i][j]+"\","
		}
		str = str.slice(0,-1)
		arr[i] = str
	}
	return "{"+arr.join("},{")+"}";
}