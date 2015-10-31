export default ngModule => {
 	ngModule.directive('playerDisplay', ()=>{
		return {
			restrict: 'A',
			scope: {
				players: '=players',
        guessing: '=guessing'
			},
			templateUrl: require('./playerDisplay.html')
		}
	})
}
