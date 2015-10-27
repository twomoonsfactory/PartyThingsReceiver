export default ngModule => {
	ngModule.directive('guessDisplay', ()=>{
		var controller = ['$scope', '$rootScope', '$q', '$timeout', 'eventService', 'gameEvents', ($scope, $rootScope, $q, $timeout, eventService, gameEvents)=>{
			$scope.registeredResponses = [];
			$scope.registeredResponseSlips = [];
			$scope.registeredPlayers = [];
			$scope.guessedResponses = [];
			$scope.unguessedResponses = [];

			$scope.registerResponse = (event, response) => {
				$scope.registeredResponses.push(response);
			};

			$scope.registerResponseSlip = (event, responseSlip) => {
				$scope.registeredResponseSlips.push(responseSlip);
			};

			$scope.registerPlayer = (event, player) => {
				$scope.registeredPlayers.push(player);
			};

			$scope.resolveGuesses = (index) => {
				if($scope.guessedResponses.length>index){
					$q.when()
					.then(()=>{
						let deferred = $q.defer();
						//send response to registered responses for animation
						_.each($scope.registeredResponses, response=>{
							response.checkIfGuessed($scope.guessedResponses[index]);
						});
						//send guessed players for response to registered players
						_.each($scope.registeredPlayers, player=>{
							player.checkIfGuessed($scope.guessedResponses[index]);
						});
						$timeout(()=>{deferred.resolve();}, 3500);
						return deferred.promise;
					})
					.then(()=>{
						let deferred = $q.defer();
						//update points for current response
						_.each($scope.registeredPlayers, player=>{
							player.checkIfScored($scope.guessedResponses[index]);
						});
						$timeout(()=>{deferred.resolve();}, 1500);
						return deferred.promise;
					})
					.then(()=>{
						//iterate next guess
						$scope.resolveGuesses(index+1);
					});
				}
				else if($scope.guessedResponses.length>0){
					//displays any unguessed responses
					$q.when()
					.then(()=>{
						if($scope.unguessedResponses.length>0){
								let deferred = $q.defer();
								_.each($scope.unguessedResponses, unguessed => {
									_.each($scope.registeredResponses, response=>{
										response.checkIfGuessed(unguessed);
									});
								})
							$timeout(()=>{deferred.resolve();}, 4500);
							return deferred.promise;
						}
					})
					.then(()=>{
						let deferred = $q.defer();
						_.each($scope.registeredPlayers, player=>{
							//updates score for unguessed
							player.checkIfUnguessed();
						})
						$timeout(()=>{deferred.resolve();}, 1250);
						return deferred.promise;
					})
					.then(()=>{
						//if guesses are resolved (and the $watch was tripped by added guesses) publish the completion
						eventService.publish(gameEvents.guessesResolved, "");
					});
				}
			};

			$scope.kickOffResolve = ()=>{
				//sorts the responses into guessed or unguessed responses and drops the previously guessed responses
				$scope.guessedResponses = [];
				$scope.unguessedResponses = [];
				_.each($scope.guessDisplay, response => {
					//pushes unguessed responses
					if(response.guesses===0&&!response.guessed) $scope.unguessedResponses.push(response);
					//pushes guessed responses
					else if(response.guesses!==0){
						$scope.guessedResponses.push(response);
					}
					_.each($scope.registeredResponses, response => {
						_.each($scope.registeredResponseSlips, responseSlip => {
							if(response.response.responseId === responseSlip.response.responseId)
								response.responseSlip = responseSlip;
						})
					})
				});
				$q.when()
				.then(()=>{
					let deferred = $q.defer();
					$timeout(()=>{deferred.resolve();}, 3000);
					return deferred.promise;
				})
				.then(()=>{
					$scope.resolveGuesses(0);
				});
			};

			//register emmitted reponse
			$rootScope.$on(gameEvents.responseRegistered, $scope.registerResponse);

			//register emmitted responseSlip
			$rootScope.$on(gameEvents.responseSlipRegistered, $scope.registerResponseSlip);

			//register emmitted player
			$rootScope.$on(gameEvents.playerRegistered, $scope.registerPlayer);

			//kick off resolution when the guesses update
			$scope.$watch('guessDisplay', $scope.kickOffResolve, true);
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
