
module.exports = function(grunt){

    grunt.initConfig({
        browserify: {
            'dist/ontrigger.js': ['lib/index.browser.js']
        },
        watch: {
            onTriggerScripts: {
                files: ['lib/index.js',' lib/index.browser.js','lib/OnTrigger.js','lib/ListenerCollection.js','lib/Listener.js','lib/TriggeredEvent.js',],
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