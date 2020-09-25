var gulp = require('gulp');
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