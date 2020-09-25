//用于新建项目，生成animate和src目录
//先检测animate文件夹和src文件夹是否存在，如果不存在就新建这两个文件夹
let fs = require('fs');
let path = require('path');

if(!fs.existsSync('../animate')){
	fs.mkdirSync('../animate');
	console.log('animate目录创建成功');
	fs.mkdirSync('../animate/resource');
	console.log('animate/resource目录创建成功');
	fs.mkdirSync('../animate/images');
	console.log('animate/images目录创建成功');
}else{
	console.log('animate目录已存在');
}
if(!fs.existsSync('../src')){
	fs.mkdirSync('../src');
	console.log('src目录创建成功');
	fs.mkdirSync('../src/js');
	console.log('js目录创建成功');
	fs.mkdirSync('../src/js/libs');
	console.log('libs目录创建成功');
	fs.mkdirSync('../src/resource');
	console.log('resource目录创建成功');
	fs.mkdirSync('../src/resource/images');
	console.log('images目录创建成功');
	fs.mkdirSync('../src/resource/sounds');
	console.log('sounds目录创建成功');
	fs.mkdirSync('../src/resource/video');
	console.log('video目录创建成功');
	fs.mkdirSync('../src/animatejs');
	console.log('animatejs目录创建成功');
	//将模板文件复制进文件夹
	copyFile(path.join(__dirname, './template/libs/createjs.min.js'), path.join(__dirname, '../src/js/libs/createjs.min.js'));
	console.log('createjs.min.js文件复制成功');
	copyFile(path.join(__dirname, './template/libs/sakuraCore.min.js'), path.join(__dirname, '../src/js/libs/sakuraCore.min.js'));
	console.log('sakuraCore.min.js文件复制成功');
	copyFile(path.join(__dirname, './template/libs/vconsole.min.js'), path.join(__dirname, '../src/js/libs/vconsole.min.js'));
	console.log('vconsole.min.js文件复制成功');
	copyFile(path.join(__dirname, './template/libs/howler.min.js'), path.join(__dirname, '../src/js/libs/howler.min.js'));
	console.log('howler.min.js文件复制成功');
	copyFile(path.join(__dirname, './template/libs/resource.js'), path.join(__dirname, '../src/js/libs/resource.js'));
	console.log('resource.js文件复制成功');
	copyFile(path.join(__dirname, './template/js/main.js'), path.join(__dirname, '../src/js/main.js'));
	console.log('main.js文件复制成功');
	copyFile(path.join(__dirname, './template/index.html'), path.join(__dirname, '../src/index.html'));
	console.log('index.html文件复制成功');
}else{
	console.log('src目录已存在');
}
//复制文件
function copyFile(sourceFile, destFile){
	let readStream = fs.createReadStream(sourceFile);
	let writeStream = fs.createWriteStream(destFile);
	readStream.pipe(writeStream);
}
