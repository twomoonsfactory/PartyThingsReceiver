export default ngModule =>{
	ngModule.directive('promtpRequest', ()=>{
		return {
			restrict: 'A',
			scope: {
				prompts: '=prompts'
			},
			templateUrl: 'src/directives/promptRequest.html'
		}
	})
}
