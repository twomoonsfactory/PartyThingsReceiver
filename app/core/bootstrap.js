/*jshint browser:true*/
'use strict';

require('./vendor')();

let appModule = require('../src/app');

angular.element(document).ready(()=>{
	angular.bootstrap(document, [appModule.name],{

	});
});
