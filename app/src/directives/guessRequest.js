export default ngModule =>{
	ngModule.directive('guessRequest', ()=>{
		return {
			restrict: 'A',
			scope: {
				responses: '=responses'
			},
			template: require('./guessRequest.html')
		}
	})
}
