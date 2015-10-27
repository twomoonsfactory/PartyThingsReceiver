require('jQuery');
require('angular-builds/angular.js');
require('angular-route');
require('underscore');
require('angular-mocks');
let appModule = require('../index.js');
let context;
context = require.context('../src', true, /promptProvider\.spec\.js$/);
context.keys().forEach(context);
