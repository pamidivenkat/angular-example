var gulp = require("gulp");
var replace = require("gulp-replace");

gulp.task("replace", function () {
    gulp.src("wwwroot/clientapp/dist/main.*.js")
        .pipe(replace("{current_date_time}", new Date().toLocaleString()))
        .pipe(gulp.dest("wwwroot/clientapp/dist/"));
});

gulp.task("default", ["replace"]);