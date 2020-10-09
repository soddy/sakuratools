var gulp = require('gulp');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var fs = require('fs');
var sourcemaps=require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var gulpPngquant = require('gulp-pngquant');
var htmlmin = require('gulp-htmlmin');
var audiosprite = require('gulp-audiosprite');
 
gulp.task('buildaudio', function() {
  	return gulp.src('../src/resource/sounds/*.mp3')
    .pipe(audiosprite({
      format: 'howler',
      bitrate: 16,
      samplerate: 11025
    }))
    .pipe(gulp.dest('../src/resource/sounds/dist'));
});

//打包压缩，生成dist文件夹，压缩src/animatejs文件夹中的js文件，拷贝js/libs文件夹中的文件，拷贝js/resource文件夹中的文件，
//压缩js文件夹中的js文件并加入sourcemap，拷贝resource/images文件夹中的图片并压缩，拷贝resource/sounds文件夹中的文件，
//拷贝resourc/video文件夹中的文件，压缩index.html文件
gulp.task('remove', done => {
    var distDir = '../dist/';
    try{
        if(fs.existsSync(distDir)){
            remove(distDir);    //删除sakuratools中的dist文件夹
        }
        done();
    }catch(err){
        console.log(err);
    }
});
gulp.task('build_animatejs', done => {
	gulp.src([
        '../src/animatejs/*.js'
    ])
    .pipe(uglify())
    .pipe(gulp.dest('../dist/animatejs/'));    //打包压缩在build目录下。

    done();
});
gulp.task('copy_libs', done => {
	gulp.src([
        '../src/js/libs/*.js'
    ])
    .pipe(gulp.dest('../dist/js/libs/'));    //打包压缩在build目录下。

    done();
});
gulp.task('copy_resource', done => {
	gulp.src([
        '../src/js/resource/*.*'
    ])
    .pipe(gulp.dest('../dist/js/resource/'));    //打包压缩在build目录下。

    done();
});
gulp.task('build_js', done => {
	setTimeout(function() {
		gulp.src([
	        '../src/js/*.js'
	    ])
	    .pipe(sourcemaps.init())
	    .pipe(uglify())
	    .pipe(sourcemaps.write('maps'))
	    .pipe(gulp.dest('../dist/js/'));    //打包压缩在build目录下。

	    done();
	},2000);
});
gulp.task('build_images', done => {
	setTimeout(function() {
		gulp.src('../src/resource/images/*.png')
		.pipe(gulpPngquant({
            quality: '65'
        }))
	    .pipe(gulp.dest('../dist/resource/images/'));    //打包压缩在build目录下。

	    gulp.src('../src/resource/images/*.{jpg,gif,ico}')
	    .pipe(imagemin({
        	progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
    	}))
    	.pipe(gulp.dest('../dist/resource/images/'));    //打包压缩在build目录下。

	    done();
	},2000);
});
gulp.task('copy_sounds', done => {
	setTimeout(function() {
		gulp.src('../src/resource/sounds/dist/*.*')
	    .pipe(gulp.dest('../dist/resource/sounds/dist/'));    //打包压缩在build目录下。

	    done();
	},2000);
});
gulp.task('copy_video', done => {
	setTimeout(function() {
		gulp.src('../src/resource/video/*.*')
	    .pipe(gulp.dest('../dist/resource/video/'));    //打包压缩在build目录下。

	    done();
	},2000);
});
gulp.task('build_html', done => {
	setTimeout(function() {
		gulp.src('../src/*.html')
	    .pipe(htmlmin({ 
            removeComments: true,       // 清除HTML注释
            collapseWhitespace: true,   // 压缩HTML
            minifyJS: false,             // 压缩页面JS
            minifyCSS: false             // 压缩页面CSS
        }))
        .pipe(gulp.dest('../dist'));

	    done();
	},2000);
});
gulp.task('build',gulp.series('remove','build_animatejs','copy_libs','copy_resource','build_js','build_images','copy_sounds','copy_video','build_html'));

/**
 * @param {需删除的路径} url 
 */
 
function remove(url) {
    // 读取原路径
    const STATUS = fs.statSync(url);
    // 如果原路径是文件
    if (STATUS.isFile()) {
        //删除原文件
        fs.unlinkSync(url);
 
    //如果原路径是目录
    } else if (STATUS.isDirectory()) {
        //如果原路径是非空目录,遍历原路径
        //空目录时无法使用forEach
        fs.readdirSync(url).forEach(item => {
            //递归调用函数，以子文件路径为新参数
            remove(`${url}/${item}`);
        });
        //删除空文件夹
        fs.rmdirSync(url);
    };
};

/**
 * @param {原始路径} originalUrl 
 * @param {目标路径} targetUrl 
 */
function copy(originalUrl, targetUrl) {
    try {
        // 读取原路径
        const STATUS = fs.statSync(originalUrl);
        // 获得原路径的末尾部分
        // 此部分亦可通过path模块中的basename()方法提取
        const fileName = originalUrl.split("/")[originalUrl.split("/").length - 1];
        // 如果原路径是文件
        if (STATUS.isFile()) {
            // 在新目录中创建同名文件，并将原文件内容追加到新文件中
            fs.writeFileSync(`${targetUrl}/${fileName}`, fs.readFileSync(originalUrl));
 
            //如果原路径是目录
        } else if (STATUS.isDirectory()) {
            //在新路径中创建新文件夹
            fs.mkdirSync(`${targetUrl}/${fileName}`);
            //如果原路径是非空目录,遍历原路径
            //空目录时无法使用forEach
            fs.readdirSync(originalUrl).forEach(item => {
                //更新参数，递归调用
                copy(`${originalUrl}/${item}`, `${targetUrl}/${fileName}`);
            });
        }
    } catch (error) {
        console.log("路径" + "有误");
    };
};

/**
 * 定义移动函数(由复制函数与删除函数组成)
 * @param {原始路径} originalUrl 
 * @param {目标路径} targetUrl 
 */
function move(originalUrl, targetUrl) {
    //复制原路径中所有
    copy(originalUrl, targetUrl);
    //删除原路径中所有
    remove(originalUrl);
};