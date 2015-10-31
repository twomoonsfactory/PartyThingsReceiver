'use strict';
var webpack = require('webpack');
var path = require('path');
//paths
var app = path.join(__dirname + '/app');
	module.exports = {
		context: app,
		entry: ['./index.js'],
		output: {
			path: app,
			filename: 'bundle.js'
		},
		module: {
			loaders: [
				{test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
				{test: /\.css$/, loader: "style!css"},
				{test: /\.scss$/, loader: "style!css!sass"},
				{test: /\.html$/, loader: "raw"}
			]
		},
		plugins: [
			new webpack.ProvidePlugin({
            	jQuery: "jQuery",
            	"windows.jQuery": "jquery"
        	}),
			new webpack.ProvidePlugin({
    			"_": "underscore"
  			})
		]
	};
