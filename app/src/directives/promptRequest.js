export default ngModule =>{
	ngModule.directive('promptRequest', ()=>{
		return {
			restrict: 'A',
			scope: {
				prompts: '=prompts'
			},
			templateUrl: 'src/directives/promptRequest.html'
		}
	})
}
