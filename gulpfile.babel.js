import gulp from 'gulp'
import babel from 'gulp-babel'
import plumber from 'gulp-plumber'

const srcDir = 'src'
const distDir = 'dist'

const build = () => {
	gulp.src(`${srcDir}/main.js`)
		.pipe(plumber())
		.pipe(babel())
		.pipe(gulp.dest(distDir))
}

gulp.task('build', build)

gulp.task('watch', ()=>{
	gulp.watch(`${srcDir}/**/*.js`, ['build'])
})

gulp.task('default', ['build', 'watch'])
