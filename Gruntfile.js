
module.exports = function(grunt){

    grunt.initConfig({
        browserify: {
            'dist/ontrigger.js': ['lib/ontrigger.browser.js']
        },
        watch: {
            onTriggerScripts: {
                files: ['lib/ontrigger.js',' lib/ontrigger.js'],
                tasks: ['browserify']
            },
            config: {
                files: ['Gruntfile.js'],
                options: {
                    reload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
};