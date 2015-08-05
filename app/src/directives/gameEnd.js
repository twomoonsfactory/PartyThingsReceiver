module.exports = function(){
		return {
			restrict: 'A',
			scope: {
				winners: '=winners'
			},
			templateUrl: 'src/directives/gameEnd.html'
		};
	};
