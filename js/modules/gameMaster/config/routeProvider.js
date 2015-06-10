angular.module('gameMaster')	
	.config(function($routeProvider, $locationProvider){
		$routeProvider

			//welcome page
			.when('/welcome', {
				templateUrl: '../../fragments/welcome.html'
			})

			//gameplay page
			.when('/gameplay',{
				templateUrl: '../../fragments/gameplay.html',
				controller: 'GameController'
			})

			//default to welcome
			.otherwise({
				redirectTo: '/welcome'
			});
	});