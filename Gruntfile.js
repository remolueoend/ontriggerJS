
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
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json', 'bower.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bump');
};