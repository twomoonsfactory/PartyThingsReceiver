export default ngModule => {
 	ngModule.directive('playerDisplay', ()=>{
		return {
			restrict: 'A',
			scope: {
				players: '=players'
			},
			templateUrl: 'src/directives/playerDisplay.html'
		}
	})
}
