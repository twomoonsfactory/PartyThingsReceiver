/*jshint browser:true*/
'use strict';

require('./core/vendor')();

import gameMasterConstants from './src/constants/index.js';
import gameMasterControllers from './src/controllers/index.js';
import gameMasterDirectives from './src/directives/index.js';
import gameMasterFactories from './src/directives/index.js';
import gameMasterServices from './src/services/index.js';

const ngModule = angular.module('gameMaster', [require('./src/castServices.js').name, gameMasterConfig, gameMasterConstants, gameMasterControllers, gameMasterDirectives, gameMasterFactories, gameMasterServices]);

import gameMasterConfig from './src/config/index.js' (ngModule);


angular.element(document).ready(()=>{
	angular.bootstrap(document, [ngModule.name],{
	});
});
