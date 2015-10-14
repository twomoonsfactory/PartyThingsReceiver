export default ngModule => {
	ngModule.directive('guessDisplay', ()=>{
		var controller = ['$scope', '$rootScope', '$q', '$timeout', 'eventService', 'gameEvents', ($scope, $rootScope, $q, $timeout, eventService, gameEvents)=>{
			$scope.registeredResponses = [];
			$scope.registeredPlayers = [];

			$scope.registerResponse = (event, response) => {
				$scope.registeredResponses.push(response);
			};

			$scope.registerPlayer = (event, player) => {
				$scope.registeredPlayers.push(player);
			};

			$scope.resolveGuesses = (index) => {
				if($scope.guessDisplay.length>index){
					$q.when()
					.then(()=>{
						let deferred = $q.defer();
						//send response to registered responses for animation if applicable
						_.each($scope.registeredResponses, response=>{
							response.checkIfGuessed($scope.guessDisplay[index]);
						});
						//send guessed players for response to registered players
						_.each($scope.registeredPlayers, player=>{
							player.checkIfGuessed($scope.guessDisplay[index]);
						});
						$timeout(()=>{deferred.resolve();}, 2000);
						return deferred.promise;
					})
					.then(()=>{
						let deferred = $q.defer();
						//update points for current response
						_.each($scope.registeredPlayers, player=>{
							player.checkIfScored($scope.guessDisplay[index]);
						});
						$timeout(()=>{deferred.resolve();}, 1000);
						return deferred.promise;
					})
					.then(()=>{
						//iterate next guess
						$scope.resolveGuesses(index+1);
					});
				}
				else if($scope.guessDisplay.length>0){
					//if guesses are resolved (and the $watch was tripped by added guesses) publish the completion
					eventService.publish(gameEvents.guessesResolved, "");
				}
			};

			$scope.kickOffResolve = ()=>{
				$scope.resolveGuesses(0);
			};

			//register emmitted reponse
			$rootScope.$on(gameEvents.responseRegistered, $scope.registerResponse);

			//register emmitted player
			$rootScope.$on(gameEvents.playerRegistered, $scope.registerPlayer);

			//kick off resolution when the guesses update
			$scope.$watch('guessDisplay', $scope.kickOffResolve);
		}]
		return{
			template: '<div ng-transclude></div>',
			restrict: 'A',
			scope:{
				guessDisplay: "="
			},
			transclude: true,
			controller: controller
		}
	})
}
