module.exports = function(){
		return {
			restrict: 'A',
			scope: {
				players: '=players'
			},
			templateUrl: 'src/directives/playerDisplay.html'
		};
	};
