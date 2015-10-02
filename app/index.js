/*jshint browser:true*/
'use strict';

require('./core/vendor')();

const ngModule = angular.module('gameMaster', ['ngRoute', 'ngMaterial', 'ngAnimate', require('./src/castServices.js').name]);
require('./src/config')(ngModule);
require('./src/constants')(ngModule);
require('./src/controllers')(ngModule);
require('./src/directives')(ngModule);
require('./src/factories')(ngModule);
require('./src/services')(ngModule);
