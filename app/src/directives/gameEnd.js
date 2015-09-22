export default ngModule =>{
		ngModule.directive('gameEnd', ()=>{
		return {
			restrict: 'A',
			scope: {
				winners: '=winners'
			},
			templateUrl: 'src/directives/gameEnd.html'
		};
	});
}
