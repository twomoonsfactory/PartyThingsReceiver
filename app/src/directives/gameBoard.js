module.exports = function(gameStates){
		var templates = {promptRequest:'src/directives/promptRequest.html',
										responseRequest:'src/directives/responseRequest.html',
										guessRequest:'src/directives/guessRequest.html',
										roundResults:'src/directives/roundResults.html',
										gameResults:'src/directives/gameResults.html'};
		var currentTemplate = templates.promptRequest;
		return {
			restrict: 'A',
			scope: {
				currentState: '=currentState',
				prompts: '=prompts',
				finalPrompt: '=finalPrompt',
				responses: '=responses',
				results: '=results',
				winners: '=winners'
			},
			link: function(scope, elem, attrs){
				var updateTemplate = function(){
					switch(scope.currentState){
						case gameStates.ReadyToStart :
							currentTemplate = templates.promptRequest;
							break;
						case gameStates.PromptChosen :
							currentTemplate = templates.responseRequest;
							break;
						case gameStates.ResponsesReceived :
							currentTemplate = templates.guessRequest;
							break;
						case gameStates.RoundEnd :
							currentTemplate = templates.roundResults;
							break;
						case gameStates.gameEnd :
							currentTemplate = templates.gameResults;
							break;
						default:
							currentTemplate = templates.promptRequest;
					}
				}
				scope.$watch(scope.currentState, function(){
					updateTemplate();
				})
			},
			templateUrl: currentTemplate
		};
	};
