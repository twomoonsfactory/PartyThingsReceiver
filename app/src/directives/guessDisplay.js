export default ngModule => {
	ngModule.directive('guessDisplay', ()=>{
		var controller = ['$scope', '$rootScope', '$q', '$timeout', 'eventService', 'gameEvents', '$mdToast', '$animate', 'gameNumbers', 'playerHandler', 'messageProvider', 'messageNames', 'playerStates',
											($scope, $rootScope, $q, $timeout, eventService, gameEvents, $mdToast, $animate, gameNumbers, playerHandler, messageProvider, messageNames, playerStates)=>{
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
				let responseToast = {};
				let playerToast = {};
				//loops through each guessed response
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
						$timeout(()=>{deferred.resolve();}, 3500);
						return deferred.promise;
					})
					.then(()=>{
						let deferred = $q.defer();

						//toast generated for the response
						//for correctly guessed
						if(responseGuessed){
							let writer = playerHandler.findPlayerByPlayerId(responseGuessed.response.playerId).playerName;
							responseToast.message = messageProvider.getToastMessage({messageType: messageNames.writerToast, pname: writer});
							responseToast.type = $scope.trueToast;
						}
						//for incorrectly guessed
						else {
							responseToast.message = messageProvider.getToastMessage({messageType: messageNames.wrongToast});
							responseToast.type = $scope.falseToast;
						}

						//find the correct guessers
						_.each($scope.registeredPlayers, player=>{
							let guessedCorrectly = player.checkIfScored($scope.guessedResponses[index]);
							if(guessedCorrectly) //if the player guessed right, true was returned
								correctGuessers.push(player);
						});
						//toasts generated for the correct guessers (if any)
						if(correctGuessers.length>0){
							playerToast.type = $scope.trueToast;
							let points=Math.floor(gameNumbers.guessScore/correctGuessers.length);
							if(correctGuessers.length===1){
								let player = playerHandler.findPlayerByPlayerId(correctGuessers[0].player.playerId).playerName;
								playerToast.message = messageProvider.getToastMessage({messageType: messageNames.oneRightToast, pname: player, points: points});
							}
							else{
								let players = '';
								for(let i = 0; i < correctGuessers.length; i++){
									if(i===0)
										players += playerHandler.findPlayerByPlayerId(correctGuessers[i].player.playerId).playerName;
									else if(i===correctGuessers.length-1)
										players+= ' & ' + playerHandler.findPlayerByPlayerId(correctGuessers[i].player.playerId).playerName;
									else
										players+= ', ' + playerHandler.findPlayerByPlayerId(correctGuessers[i].player.playerId).playerName;
								}
								playerToast.message = messageProvider.getToastMessage({messageType: messageNames.multipleRightToast, pname: players, points: points});
							}
						}
						else{
							playerToast.message = messageProvider.getToastMessage({messageType: messageNames.wrongPlayerToast});
							playerToast.type = $scope.falseToast;
						}
						$scope.showToast(responseToast, playerToast, 8000);
						$timeout(()=>{deferred.resolve();}, 5000);
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
						if(correctGuessers.length>0){
							//points updated if there were
							_.each(correctGuessers, guesser=>{
								guesser.addPoints(Math.floor(gameNumbers.guessScore/correctGuessers.length));
							});
						}
						$timeout(()=>{deferred.resolve();}, 3000);
						return deferred.promise;
					})
					.then(()=>{
						//iterate next guess
						$scope.resolveGuesses(index+1);
					});
				}

				//loops through IF there were guessed responses
				else if($scope.guessedResponses.length>0){
					let unguessedResponses = [];
					let unguessedPlayers = [];
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
							$timeout(()=>{deferred.resolve();}, 8000);
							return deferred.promise;
						}
						deferred.resolve(false);
						return deferred.promise;
					})
					.then(()=>{
						let deferred = $q.defer();
						if(unguessedResponses.length>0){
							//generates toast for the unguessed
							responseToast.message = messageProvider.getToastMessage({messageType: messageNames.unguessedResponseToast});
							responseToast.type = $scope.unguessedToast;
						}
						else{
							//generates toast for having no unguessed responses
							responseToast.message = messageProvider.getToastMessage({messageType: messageNames.noUnguessedResponseToast});
							responseToast.type = $scope.trueToast;
						}
					})
					.then(()=>{
						_.each($scope.registeredPlayers, player=>{
							//checks each player to see if unguessed, but only if they are participating
							if(!player.player.checkState(playerStates.incoming)&&!player.player.checkState(playerStates.quit)&&!player.player.checkState(playerStates.standingBy)){
								let playerUnguessed =	player.checkIfUnguessed();
								if(playerUnguessed) //true returned if player was unguessed
									unguessedPlayers.push(player);
							}
						});
						//toast and score update accordingly
						let deferred = $q.defer();
						if(unguessedPlayers.length>0){
							playerToast.message = messageProvider.getToastMessage({messageType: messageNames.unguessedPlayersToast, points: gameNumbers.unguessedScore});
							playerToast.type = $scope.trueToast;
						}
						else{
							playerToast.message = messageProvider.getToastMessage({messageType: messageNames.noUnguessedPlayersToast});
							playerToast.type = $scope.falseToast;
						}
						$scope.showToast(responseToast, playerToast, 8000);
						$timeout(()=>{deferred.resolve(unguessedPlayers);}, 4000);
						return deferred.promise
					})
					.then(()=>{
						if(unguessedResponses.length>0){
							//return it to the proper state
							_.each(unguessedResponses, response=>{
								response.resolveAnimation();
							});
						}
					})
					.then(()=>{
						let deferred = $q.defer();
						if(unguessedPlayers.length>0){
							_.each(unguessedPlayers, player=>{
								player.addPoints(gameNumbers.unguessedScore);
							});
							$timeout(()=>{deferred.resolve();}, 3500);
						}
						else $timeout(()=>{deferred.resolve();},4500);
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

			//displays the "responseToast" on the left, then the "playerToast" on the right,
			//after 1/2 of the time value have elapsed, so that each toast displays equally.
			//right now angular-material doesn't support simultaneous toasts, but the code
			//has been written for easy implementation when it is supported post-1.0.
			$scope.showToast = (responseToast, playerToast, time)=>{
				$q.when()
					.then(()=>{
						$mdToast.show({
								template: '<md-toast class="md-toast responseToast ' + responseToast.type + '">' + responseToast.message + '</md-toast>',
								position: 'bottom left',
								hideDelay: time/2
							});
					})
					.then(()=>{
						let deferred = $q.defer();
						$timeout(()=>{deferred.resolve();}, time/2);
						return deferred.promise;
					})
					.then(()=>{
						if(playerToast){
							$mdToast.show({
								template: '<md-toast class="md-toast playerToast ' + playerToast.type + '">' + playerToast.message + '</md-toast>',
								position: 'bottom right',
								hideDelay: time/2
							})
						}
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
			template: '<div ng-transclude class="gameContainer"></div>',
			restrict: 'A',
			scope:{
				guessDisplay: "="
			},
			transclude: true,
			controller: controller
		}
	})
}
