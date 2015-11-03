export default ngModule => {
 	ngModule.directive('playerDisplay', ()=>{
		return {
			restrict: 'A',
			scope: {
				players: '=players',
        guessing: '=guessing'
			},
			template: require('./playerDisplay.html')
		}
	})
}
