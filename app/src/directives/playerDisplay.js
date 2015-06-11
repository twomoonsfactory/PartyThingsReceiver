module.exports = function(){
		return {
			restrict: 'E',
			scope: {
				display: '=info'
			},
			templateUrl: 'src/directives/playerDisplay.html'
		};
	};