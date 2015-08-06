export default ngModule =>{
	ngModule.directive('guessRequest', ()=>{
		return {
			restrict: 'A',
			scope: {
				responses: '=responses'
			},
			templateUrl: 'src/directives/guessRequest.html'
		}
	})
}
