/*jshint browser:true*/
'use strict';
//load Angular
require('./vendor')();
// load the main app
var appModule = require('../src/app');
//now you don't need ng-app='appName'
angular.element(document).ready(function(){
	angular.bootstrap(document, [appModule.name],{
		//strictDi: true
	});
});