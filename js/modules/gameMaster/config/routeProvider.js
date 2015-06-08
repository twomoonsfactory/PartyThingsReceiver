angular.module('gameMaster')
	.config(function($routeProvider){
		$routeProvider
			//welcome page
			.when('/welcome', {
				templateUrl: '../../../../pages/welcome.html',
				controller: 'gameController'
			})

			//gameplay page
			.when('/gameplay',{
				templateUrl: '../../../../pages/gameplay.html',
				controller: 'gameController'
			})

			//default to welcome
			.otherwise({
				redirectTo: '/welcome'
			});
	});