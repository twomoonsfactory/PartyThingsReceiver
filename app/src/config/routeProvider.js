module.exports = angular.module('gameMaster')	
	.config(function($routeProvider, $locationProvider){
		$routeProvider

			//welcome page
			.when('/welcome', {
				templateUrl: '../../fragments/welcome.html',
				controller: 'gameController'
			})

			//gameplay page
			.when('/gameplay',{
				templateUrl: '../../fragments/gameplay.html',
				controller: 'gameController'
			})

			//default to welcome
			.otherwise({
				redirectTo: '/welcome'
			});
	});