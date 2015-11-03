export default ngModule =>{
	ngModule.directive('promptRequest', ()=>{
		return {
			restrict: 'A',
			scope: {
				prompts: '=prompts'
			},
			template: require('./promptRequest.html')
		}
	})
}
