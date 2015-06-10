module.exports = angular.module('gameMaster')
	.directive('playerDisplay', function(){
		return {
			restrict: 'E',
			scope: {
				display: '=info'
			},
			templateUrl: 'js/modules/gameMaster/directives/playerDisplay.html'
		};
	});