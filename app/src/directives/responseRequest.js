export default ngModule => {
	ngModule.directive('responseRequest', ()=>{
		return {
			restrict: 'A',
			scope: {
				prompt: '=prompt'
			},
			template: require('./responseRequest.html')
		}
	})
}
