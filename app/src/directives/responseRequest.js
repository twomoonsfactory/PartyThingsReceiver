export default ngModule => {
	ngModule.directive('responseRequest', ()=>{
		return {
			restrict: 'A',
			scope: {
				prompt: '=prompt'
			},
			templateUrl: require('./responseRequest.html')
		}
	})
}
