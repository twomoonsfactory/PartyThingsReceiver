'use strict';
var webpack = require('webpack'),
path = require('path');
//paths
var app = path.join(__dirname + '/app');
	module.exports = {
		context: app,
		entry: ['webpack/hot/dev-server', './core/bootstrap'],
		output: {
			path: app,
			filename: 'bundle.js'
		},
		module: {
			loaders: [
				{test: /\.less$/, loader: "style!css!less"},

				{test: /\.css$/, loader: "style!css"}
			]
		}
	};
