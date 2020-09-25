let fs = require('fs');
let path = require('path');

let _path = '../animate/loading.js';
let baseName = path.basename(_path, '.js');
let className = get_class_name(baseName);
fs.readFile(_path, 'utf8', function(err, data){
	if(err) throw err;
	let replaceData = data.replace(/lib\,/g, ''+ className +',').replace(/lib\./g, ''+ className +'.').replace(/lib = lib/g, ''+ className +' = '+ className +'');

	let _start = find(replaceData, 'manifest', 0);
	let _end = replaceData.indexOf(']',_start) + 1;
	let manifestStr = manifestReplaceStr = replaceData.substring(_start, _end);
	manifestStr = manifestStr.replace(/manifest\:/g, '').replace(/\n/g, '').replace(/\t/g, '');
	let manifestArr = eval("("+manifestStr+")");
	let newManifestArr = [];
	let newManifestObj = {};
	//将jquery cdn地址转为本次
	for(let i=0;i<manifestArr.length;i++){
		if(manifestArr[i]['src'].indexOf('jquery') > -1){
			newManifestObj['src'] = 'libs/jquery.min.js?' + manifestArr[i]['src'].split('?')[1];
			newManifestObj['id'] = 'jquery.js';
		}else if(manifestArr[i]['src'].indexOf('components') > -1){
			newManifestObj['src'] = 'libs/' + manifestArr[i]['src'].split('/').pop();
			newManifestObj['id'] = manifestArr[i]['id'].split('/').pop();
		}else{
			newManifestObj['src'] = manifestArr[i]['src'];
			newManifestObj['id'] = manifestArr[i]['id'];
		}
		newManifestArr.push(newManifestObj);
		newManifestObj = {};
	}

	for(var i=0;i<newManifestArr.length;i++){
		var str=""
		for(var j in newManifestArr[i]){
			str+=j+":\""+newManifestArr[i][j]+"\","
		}
		str=str.slice(0,-1)
		newManifestArr[i]=str
	}
	var str1="{"+newManifestArr.join("},{")+"}";

	replaceData = replaceData.replace(manifestReplaceStr, 'manifestfest: [' + str1 + ']');

	//let newLength = replaceData.split('new '+className+'').length - 1;
	//for(let i=0;i<newLength;i++){
	//	let _start = find(replaceData, 'new '+className+'', i);
	//	let _end = replaceData.indexOf(')',_start) + 1;
	//	let replaceStr = replaceData.substring(_start, _end);
    //
	//	replaceData = replaceData.replace(replaceStr, 'sakura.movieClip('+replaceStr+')');
	//}
    //
	//let outputPath = path.join(__dirname, '../web/animatejs/'+ path.basename(_path) +'');
	//fs.writeFile(outputPath, replaceData, 'utf8', function(err){
	//	if(err) throw err;
	//});

	//if(!fs.existsSync(path.join(__dirname, '../web/src/'+ baseName +'Class.js'))){
	//	fs.readFile('template/src/templateClass.tpl', 'utf8', function(err, data){
	//		if(err) throw err;
	//		let replaceData = data.replace(/\{Template\}/g, ''+ className +'').replace(/\{TemplateMethod\}/g, ''+ baseName +'');
	//		let outputPath = path.join(__dirname, '../web/src/'+ baseName +'Class.js');
	//		fs.writeFile(outputPath, replaceData, 'utf8', function(err){
	//			if(err) throw err;
	//			//console.log(path.basename(_path) + ' ' + _status);
	//		});
	//	});
	//}
});

//转变为首字母大写
function get_class_name(className){
	var _className = className.substring(0,1).toUpperCase()+className.substring(1);
    return _className;
}

function find(str,cha,num){
	var x=str.indexOf(cha);
	for(var i=0;i<num;i++){
		x=str.indexOf(cha,x+1);
	}
	return x;
}

