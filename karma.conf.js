// Karma configuration
// Generated on Mon Jul 13 2015 08:25:18 GMT-0600 (Mountain Daylight Time)
var webpack = require('webpack');
// var path = require('path');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      // './node_modules/jquery/dist/jquery.js',
      // './node_modules/angular-builds/angular.js',
      // './node_modules/angular-mocks/angular-mocks.js',
      // './node_modules/angular-route/angular-route.js',
      // './node_modules/underscore/underscore.js',
      './app/src/tests.spec.js'
      // 'app/src/services/stateManager.spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './app/src/tests.spec.js':['webpack', 'sourcemap']
      // 'app/src/services/stateManager.spec.js':['webpack']
    },

    webpack: {
      module: {
        loaders: [
          {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},

          {test: /\.less$/, loader: "style!css!less"},

          {test: /\.css$/, loader: "style!css"}
        ]
      },
      plugins: [
        new webpack.ProvidePlugin({
                jQuery: "jQuery",
                "windows.jQuery": "jquery"
            }),
        new webpack.ProvidePlugin({
            "_": "underscore"
          }),
        require("karma-webpack")
      ],
      watch: true,
      devtool: 'inline-source-map'
    },

    webpackMiddleware: {
      noInfo:true
    },

    plugins: [
        require('karma-sourcemap-loader'),
        require('karma-webpack'),
        require('karma-jasmine'),
        require('karma-chrome-launcher')
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
}
