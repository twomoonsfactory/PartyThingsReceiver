module.exports = function(){
	/* JS */
	require('angular-builds/angular.js');
	require('angular-route');
	require('underscore');
	require('jquery');
	require('bootstrap');

	/* Styles */
	require('../index.less');
	require('../styles/styling.less');
	require('../../node_modules/bootstrap/less/bootstrap.less');
	//had to comment out a few things in their base style to avoid font load issues
};