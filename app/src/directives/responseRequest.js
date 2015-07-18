module.exports = function(){
		return {
			restrict: 'A',
			scope: {
				prompt: '=prompt'
			},
			templateUrl: 'src/directives/responseRequest.html'
		};
	};
