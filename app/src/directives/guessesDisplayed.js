export default ngModule => {
	ngModule.directive('guessesDisplayed', ['$q', '$timeout', 'stateManager', 'gameStates', 'playerHandler', ($q, $timeout, stateManager, gameStates, playerHandler)=>{
		return {
			link: (scope, elem, attrs) => {
				let messages = [];
				$q.when()
				.then(()=>{
					let deferred = $q.defer();
					stateManager.endRoundMessageUpdate(playerHandler.winnersChosen());
					$timeout(()=>{deferred.resolve();}, 5000);
					return deferred.promise;
				})
				.then(()=>{
					stateManager.setState(gameStates.RoundEnd);
				});
			}
		}
	}]);
}
