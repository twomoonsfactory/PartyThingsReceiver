require('jQuery');
require('angular-builds/angular.js');
require('angular-route');
require('underscore');
require('angular-mocks');
let appModule = require('../src/app');
let context;
context = require.context('../src', true, /\.spec\.js$/);
context.keys().forEach(context);
