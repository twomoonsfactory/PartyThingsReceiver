module.exports = function(){
		return {
			restrict: 'A',
			scope: {
				responses: '=responses'
			},
			templateUrl: 'src/directives/guessRequest.html'
		};
	};
