require('./castServices');
require('./config/routeProvider');
// require('./constants/index');
// require('./controllers/index');
// require('./directives/index');
// require('./factories/index');
// require('./services/index');
module.exports = angular.module('gameMaster', ['ngRoute', 'castServices']);

console.log('thingy');
//all display changes still need to be written in -- all internal except the basic test at the moment
//abstract out text  
