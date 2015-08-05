/*jshint browser:true*/
'use strict';

require('./vendor')();

var appModule = require('../src/app');

angular.element(document).ready(function(){
	angular.bootstrap(document, [appModule.name],{

	});
});
