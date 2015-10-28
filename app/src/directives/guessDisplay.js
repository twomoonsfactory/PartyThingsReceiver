export default ngModule => {
	ngModule.directive('guessDisplay', ()=>{
		var controller = ['$scope', '$rootScope', '$q', '$timeout', 'eventService', 'gameEvents', '$mdToast', '$animate', 'gameNumbers', 'playerHandler', ($scope, $rootScope, $q, $timeout, eventService, gameEvents, $mdToast, $animate, gameNumbers, playerHandler)=>{
			$scope.registeredResponses = [];
			$scope.registeredResponseSlips = [];
			$scope.registeredPlayers = [];
			$scope.guessedResponses = [];
			$scope.unguessedResponses = [];

			//toast styles
			$scope.trueToast = "trueToast";
			$scope.falseToast = "falseToast";
			$scope.unguessedToast = "unguessedToast";

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
					let responseGuessed = null;
					let playerGuessed = null;
					let correctGuessers = [];
					$q.when()
					.then(()=>{
						let deferred = $q.defer();
						//send response to registered responses for animation
						_.each($scope.registeredResponses, response=>{
							let guessedCorrectly = response.checkIfGuessed($scope.guessedResponses[index]);
							if(guessedCorrectly) //true was returned if this response was guessed correctly
								responseGuessed = response;
						});
						//send guessed players to registered players for evaluation
						_.each($scope.registeredPlayers, player=>{
							let wasGuessed = player.checkIfGuessed($scope.guessedResponses[index]);
							if(wasGuessed) //if the player was the writer of a correclty guessed prompt, true was returned
								playerGuessed = player;
						});
						$timeout(()=>{deferred.resolve(responseGuessed);}, 3500);
						return deferred.promise;
					})
					.then(()=>{
						let deferred = $q.defer();
						//toasts displayed
						let type = "";
						let message = "";
						//for correctly guessed
						if(responseGuessed){
							let writer = playerHandler.findPlayerByPlayerId(responseGuessed.response.playerId).playerName;
							message = writer + ' wrote it!';
							type = $scope.trueToast;
						}
						//for incorrectly guessed
						else {
							message = "You couldn't guess right?  Try harder!";
							type = $scope.falseToast;
						}
						$scope.showToast(message, 1000, true, type);
						$timeout(()=>{deferred.resolve();}, 1000);
						return deferred.promise;
					})
					.then(()=>{
						//states resolved
						_.each($scope.registeredResponses, response=>{
							response.resolveAnimation();
						});
						_.each($scope.registeredPlayers, player=>{
							player.resolveAnimation();
						});
					})
					.then(()=>{
						let deferred = $q.defer();
						//find the correct guessers
						_.each($scope.registeredPlayers, player=>{
							let guessedCorrectly = player.checkIfScored($scope.guessedResponses[index]);
							if(guessedCorrectly) //if the player guessed right, true was returned
								correctGuessers.push(player);
						});
						//toasts displayed for the correct guessers (if any)
						if(correctGuessers.length>0){
							let message = '';
							let type = $scope.trueToast;
							let points=Math.floor(gameNumbers.guessScore/correctGuessers.length);
							if(correctGuessers.length===1){
								let player = playerHandler.findPlayerByPlayerId(correctGuessers[0].player.playerId).playerName;
								message = 'Nice ' + player + ', you  get ' + points + ' points!';
							}
							else{
								let players = '';
								for(let i = 0; i < correctGuessers.length; i++){
									if(i===0)
										players += playerHandler.findPlayerByPlayerId(correctGuessers[i].player.playerId).playerName;
									else if(i===correctGuessers.length-1)
										players+= '& ' + playerHandler.findPlayerByPlayerId(correctGuessers[i].player.playerId).playerName;
									else
										players+= ', ' + playerHandler.findPlayerByPlayerId(correctGuessers[i].player.playerId).playerName;
								}
								message = players + ' each get ' + points + ' for sharing the guess!';
							}
							$scope.showToast(message, 2000, false, type);
							$timeout(()=>{deferred.resolve(correctGuessers);}, 1000);
							return deferred.promise;
						}
					})
					.then((correctGuessers)=>{
						let deferred = $q.defer();
						if(correctGuessers){
							//points updated if there were
							_.each(correctGuessers, guesser=>{
								guesser.addPoints(Math.floor(gameNumbers.guessScore/correctGuessers.length));
							});
							$timeout(()=>{deferred.resolve();}, 1000);
							return deferred.promise;
						}
					})
					.then(()=>{
						//iterate next guess
						$scope.resolveGuesses(index+1);
					});
				}
				else if($scope.guessedResponses.length>0){
					let unguessedResponses = [];
					//displays any unguessed responses
					$q.when()
					.then(()=>{
						let deferred = $q.defer();
						if($scope.unguessedResponses.length>0){
								_.each($scope.unguessedResponses, unguessed => {
									_.each($scope.registeredResponses, response=>{
										let unguessedResponse = response.checkIfUnguessed(unguessed);
										if(unguessedResponse) //returned true if response was unguessed
											unguessedResponses.push(response);
									});
								})
							$timeout(()=>{deferred.resolve(true);}, 3000);
							return deferred.promise;
						}
						deferred.resolve(false);
						return deferred.promise;
					})
					.then((unguessed)=>{
						let deferred = $q.defer();
						if(unguessed){
							//toast for the unguessed
							let message = "Nobody bothered guessing these..."
							let type = $scope.unguessedToast;
							$scope.showToast(message, 2000, true, type);

							$timeout(()=>{deferred.resolve(unguessed);}, 1000);
							return deferred.promise;
						}
					})
					.then((unguessed)=>{
						if(unguessed){
							//return it to the proper state
							_.each(unguessedResponses, response=>{
								response.resolveAnimation();
							});
						}
					})
					.then(()=>{
						let unguessedPlayers = [];
						_.each($scope.registeredPlayers, player=>{
							//checks each player to see if unguessed
							let playerUnguessed =	player.checkIfUnguessed();
							if(playerUnguessed) //true returned if player was unguessed
								unguessedPlayers.push(player);
						});
						//toast and score update accordingly
						if(unguessedPlayers.length>0){
							let deferred = $q.defer();
							let message = 'Unguessed players get a free ' + gameNumbers.unguessedScore + ' points!';
							let type = $scope.trueToast;
							$scope.showToast(message, 2000, false, type);
							$timeout(()=>{deferred.resolve(unguessedPlayers);}, 1000);
							return deferred.promise
						}
					})
					.then((unguessedPlayers)=>{
						if(unguessedPlayers){
							let deferred = $q.defer();
							_.each(unguessedPlayers, player=>{
								player.addPoints(gameNumbers.unguessedScore);
							});
							$timeout(()=>{deferred.resolve();}, 1250);
							return deferred.promise;
						}
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

			$scope.showToast = (message, time, left, type)=>{
				$mdToast.show({
						template: '<md-toast class="md-toast ' + type + '"><h3>' + message + '</h3></md-toast>',
						position: left?'bottom left':'bottom right',
						hideDelay: time
					}
				);
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
