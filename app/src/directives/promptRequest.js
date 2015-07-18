module.exports = function(){
		return {
			restrict: 'A',
			scope: {
				prompts: '=prompts'
			},
			templateUrl: 'src/directives/promptRequest.html'
		};
	};
