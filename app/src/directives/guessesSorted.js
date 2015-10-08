export default ngModule => {
	ngModule.directive('guessesSorted', ()=>{
		var controller = ['$scope', '$log', '$q', '$interval', 'playerHandler', 'eventService', 'gameEvents', '$timeout', 'messageProvider', 'messageNames', ($scope, $log, $q, $interval, playerHandler, eventService, gameEvents, $timeout, messageProvider, messageNames)=>{
			function init(){
				$scope.guesses = angular.copy($scope.guesses);
			}
			init();

			$scope.rightGuesses=$scope.guesses.guessedRight;
			$scope.wrongGuesses=$scope.guesses.guessedWrong;
			$scope.messageLine = [];
			$scope.responseLine = [];
			$scope.detailLine = [];
			$scope.guessLine = [];
			$scope.subMessageLine = [];
			$scope.responseTime = 3000;
			$scope.guessTime = 4000;
			$scope.baseGuessPoints = 10;
			$scope.unguessedPoints = 5;

			//core logic for the guess results render:  Iterates first through incorrect guesses, updating the arrays which are dynamically updated on the DOM, then correct guesses, then unguessed players.
			//updates and assigns points as well for a live game experience.
			$q.when()
			.then(()=>{
				let deferred = $q.defer();
				//pushes incorrect guess message
				$scope.messageLine.push(messageProvider.getMessage({messageName: $scope.wrongGuesses.length > 0 ? messageNames.wrongDisplay : messageNames.noWrongDisplay}));
				$timeout(()=>{deferred.resolve();}, $scope.responseTime);
				return deferred.promise;
			})
			.then(()=>{
				let deferred = $q.defer();
				$timeout(()=>{deferred.resolve();},$scope.wrongGuessTime());
				//kicks off loop through wrong guesses and guessers
				$scope.wrongGuessResolve($scope.wrongGuesses,0);
				return deferred.promise;
			})
			.then(()=>{
				let deferred = $q.defer();
				//freshes display for correct guesses
				$scope.wipeBoard();
				//pushes correct guess message
				$scope.messageLine.push(messageProvider.getMessage({messageName: $scope.rightGuesses.length > 0 ? messageNames.rightDisplay : messageNames.noRightDisplay}));
				$timeout(()=>{deferred.resolve();}, $scope.responseTime);
				return deferred.promise;
			})
			.then(()=>{
				let deferred = $q.defer();
				$timeout(()=>{deferred.resolve();},$scope.rightGuessTime());
				//kicks off loop through correct guesses and guessers
				$scope.rightGuessResolve($scope.rightGuesses,0);
				return deferred.promise;
			})
			.then(()=>{
				let deferred = $q.defer();
				//freshes display for unguessed
				$scope.wipeBoard();
				//pushes unguessed message
				$scope.messageLine.push(messageProvider.getMessage({messageName: messageNames.unguessedDisplay}));
				$timeout(()=>{deferred.resolve();}, $scope.responseTime);
				return deferred.promise;
			})
			.then(()=>{
				let deferred = $q.defer();
				let unguessed = playerHandler.getElegiblePlayers();
				$timeout(()=>{deferred.resolve();}, unguessedTime(unguessed));
				//kicks off loop for unguessed players.
				$scope.unguessedResolve(unguessed);
				return deferred.promise;
			})
			.then(()=>{
				let deferred = $q.defer();
				//wipes for final message
				$scope.wipeBoard();
				//message that either another round of guessing is kicked off, or that's it for this round
				$scope.messageLine.push(messageProvider.getMessage({messageName: playerHandler.unguessedPlayers() ? messageNames.moreGuessing : messageNames.allGuessed}));
				$scope.guessLine.push(messageProvider.getMessage({messageName: playerHandler.highScore() >= playerHandler.winningScore ? messageNames.gameOver : messageNames.anotherRound}));
				$timeout(()=>{deferred.resolve();}, $scope.guessTime);
				return deferred.promise;
			})
			.then(()=>{
				//pushes the game into the next state, whether it loops back for more guesses or kicks off the end of round procedures
				eventService.publish(gameEvents.guessesResolved, "");
			});
			//wipes the display clear
			$scope.wipeBoard = () =>{
				$scope.messageLine = [];
				$scope.responseLine = [];
				$scope.detailLine = [];
				$scope.guessLine = [];
				$scope.subMessageLine = [];
			}
			//wipes all but the messageLine
			$scope.wipeCard = () =>{
				$scope.responseLine = [];
				$scope.detailLine = [];
				$scope.guessLine = [];
				$scope.subMessageLine = [];
			}
			//resolves the wrong guesses and kicks off loops for the wrong guessers
			$scope.wrongGuessResolve = (wrongGuesses, guessIndex) =>{
				if(wrongGuesses.length>0){
					$q.when()
					.then(()=>{
						let deferred = $q.defer();
						$log.log("guess: " + wrongGuesses[guessIndex].response + " with " + wrongGuesses[guessIndex].guessers.length + " guessers");
						//drops everything that was on display (except the main messageLine) and pushes the next guess to be iterated
						$scope.wipeCard();
						$scope.responseLine.push(wrongGuesses[guessIndex].response);
						// $scope.detailLine.push(messageProvider.getMessage({messageName: messageNames.guessedWrong}));
						$timeout(()=>{deferred.resolve()},$scope.responseTime);
						return deferred.promise;
					})
					.then(()=>{
						let deferred = $q.defer();
						//kicks off iteration through wrong guessers.
						$scope.wrongGuesserResolve(wrongGuesses[guessIndex].guessers, 0);
						$timeout(()=>{deferred.resolve()},$scope.guessTime*wrongGuesses[guessIndex].guessers.length);
						return deferred.promise;
					})
					.then(()=>{
						let deferred = $q.defer();
						//if there are more wrong guesses, kicks off another loop through the process. Otherwise, it returns to the prior processes.
							if(guessIndex + 1 !== wrongGuesses.length)
								return $scope.wrongGuessResolve(wrongGuesses, guessIndex + 1);
							else
								return deferred.promise;
					});
				}
				else{
					//wipes the board except for the message line, and displays a "no wrong guesses" message
					$scope.wipeCard();
					$scope.guessLine.push(messageProvider.getMessage({messageName: messageNames.noWrongGuesses}));
					$log.log('no wrong guesses');
					let deferred = $q.defer();
					return deferred.promise;
				}
			}
			//iterates through the wrong guessers for each guess and who they guessed.
			$scope.wrongGuesserResolve = (wrongGuessers, guesserIndex) => {
				$q.when()
				.then(()=>{
					let deferred = $q.defer();
					$log.log("guesser: " + wrongGuessers[guesserIndex].guesser);
					//adds next wrong guess for the response to the board
					$scope.guessLine.push(messageProvider.getMessage({messageName: messageNames.wrongGuess, pname: wrongGuessers[guesserIndex].guesser, pname2: wrongGuessers[guesserIndex].guessedWriter}));
					$timeout(()=>{deferred.resolve();}, $scope.guessTime);
					return deferred.promise;
				})
				.then(()=>{
					let deferred = $q.defer();
					//loops back to add the next wrong guess to the board, or gives a short amount of time to review the wrong guesses.
					if(guesserIndex + 1 !== wrongGuessers.length)
						return $scope.wrongGuesserResolve(wrongGuessers, guesserIndex + 1);
					else{
						$timeout(()=>{deferred.resolve();}, (wrongGuessers.length-1) * $scope.guessTime);
						return deferred.promise;
					}
				})
				.then(()=>{
					let deferred = $q.defer();
					return deferred.promise;
				});
			}
			//establishes how much time to delay the core logic before progressing on to the correct guesses accordng to how many incorrect guesses and guessers there are.
			$scope.wrongGuessTime = ()=>{
				let time = 0;
				if($scope.wrongGuesses.length>0){
					_.each($scope.wrongGuesses, (wrongGuess) => {
					 time += wrongGuess.guessers.length * $scope.guessTime;
					});
					time += $scope.wrongGuesses.length * $scope.responseTime;
				}
				else
					time += $scope.responseTime;
				time += $scope.responseTime;
				return time;
			}
			//iterates through correct guesses, updating the board accordingly.
			$scope.rightGuessResolve = (rightGuesses, guessIndex) => {
				if(rightGuesses.length>0){
					$q.when()
					.then(()=>{
						let deferred = $q.defer();
						//wipes the board of the prior correctly guessed response (if any) and posts the current one.
						$scope.wipeCard();
						$scope.responseLine.push(rightGuesses[guessIndex].response);
						$timeout(()=>{deferred.resolve()}, $scope.responseTime);
						return deferred.promise;
					})
					.then(()=>{
						let deferred = $q.defer();
						//adds the writer and marks them as guessed
						$scope.detailLine.push(messageProvider.getMessage({messageName: messageNames.guessedRight, pname: rightGuesses[guessIndex].writer}));
						$log.log(rightGuesses[guessIndex].writer + ' was guessed by ' + rightGuesses[guessIndex].guessers.length + ' people');
						//marks the writer guessed
						playerHandler.playerGuessed({playerId: rightGuesses[guessIndex].writerId});
						$timeout(()=>{deferred.resolve()}, $scope.responseTime);
						return deferred.promise;
					})
					.then(()=>{
						let deferred = $q.defer();
						//kicks off a loop through the correct guessers
						$scope.rightGuesserResolve(rightGuesses[guessIndex].guessers, 0);
						$timeout(()=>{deferred.resolve()}, $scope.guessTime*rightGuesses[guessIndex].guessers.length+$scope.responseTime);
						return deferred.promise;
					})
					.then(()=>{
						//kicks off another loop through if there are any correct guesses left, otherwise, returns to core logic.
						let deferred = $q.defer();
						if(guessIndex + 1 !== rightGuesses.length)
							return $scope.rightGuessResolve(rightGuesses, guessIndex + 1);
						else
							return deferred.promise;
					});
				}
				else{
					//posts message of no correct guesses.
					$scope.guessLine.push(messageProvider.getMessage({messageName: messageNames.noRightGuesses}));
					$log.log('no right guesses');
					let deferred = $q.defer();
					return deferred.promise;
				}
			}
			//iterates through the correct guessers for each guess and assigns points for guessing correctly
			$scope.rightGuesserResolve = (rightGuessers, guesserIndex) => {
				if(rightGuessers.length>0){
					$q.when()
					.then(()=>{
						let deferred = $q.defer();
						if(guesserIndex===0)
							$scope.guessLine.push(messageProvider.getMessage({messageName: messageNames.rightGuesser, pname: rightGuessers[guesserIndex].guesser}));
						else
							$scope.guessLine.push(messageProvider.getMessage({messageName: messageNames.anotherRightGuesser, pname: rightGuessers[guesserIndex].guesser}));
						$log.log(rightGuessers[guesserIndex].guesser + ' guessed it');
						$timeout(()=>{deferred.resolve()}, $scope.guessTime);
						return deferred.promise;
					})
					.then(()=>{
						let deferred = $q.defer();
						//loops back to add any additional guessers to the board or continue on
						if(guesserIndex + 1 !== rightGuessers.length)
							$scope.rightGuesserResolve(rightGuessers, guesserIndex+1);
						else{
							$timeout(()=>{deferred.resolve()}, 0);
							return deferred.promise;
						}
					})
					.then(()=>{
						let deferred = $q.defer();
						//makes sure it will only run at the end of recursion
						if(rightGuessers.length === guesserIndex +1){
							//determines points and displays message based on one or multiple correct guesses
							let points = Math.floor($scope.baseGuessPoints/rightGuessers.length)
							if(rightGuessers.length === 1)
								$scope.subMessageLine.push(messageProvider.getMessage({messageName: messageNames.oneRightGuesser, points: points}));
							else {
								$scope.subMessageLine.push(messageProvider.getMessage({messageName: messageNames.multiRightGuessers, points: points}));
							}
							//assigns points to players
							_.each(rightGuessers, (rightGuesser) => {
								playerHandler.assignPoints({playerId: rightGuesser.guesserId, points: points});
							});
							$timeout(()=>{deferred.resolve()}, $scope.responseTime);
							return deferred.promise;
						}
						else {
							return deferred.promise;
						}
					});
				}
				else {
					let deferred = $q.defer();
					return referred.promise;
				}
			}
			//delays game logic based on the number of correct guesses and guessers
			$scope.rightGuessTime = ()=>{
				let time = 0;
				if($scope.rightGuesses.length>0){
					_.each($scope.rightGuesses, (rightGuess) => {
						time += rightGuess.guessers.length * $scope.guessTime;
					});
					time += $scope.rightGuesses.length * $scope.responseTime * 3;
				}
				else
					time += $scope.responseTime;
				time += $scope.responseTime;
				return time;
			}
			//updates display and points for unguessed players
			$scope.unguessedResolve = (unguessed) => {
				//happens for multiple unguessed players
				if(unguessed.length>1){
					$q.when()
					.then(()=>{
						let deferred = $q.defer();
						//adds unguessed player to the board
						$scope.guessLine.push(messageProvider.getMessage({messageName: messageNames.unguessedPlayers, pname: unguessed.length, points:  $scope.unguessedPoints}));
						//assigns points for being uguessed
						_.each(unguessed, player =>{
							playerHandler.assignPoints({playerId: player.playerId, points: $scope.unguessedPoints})
							$log.log(player.playerName + ' unguessed');
						});
						$timeout(()=>{deferred.resolve();}, $scope.responseTime);
						return deferred.promise;
					});
				}
				//happens for a single unguessed player
				else if(unguessed.length === 1){
					$q.when()
					.then(()=>{
						let deferred = $q.defer();
						//posts unguessed player message
						$scope.guessLine.push(messageProvider.getMessage({messageName: messageNames.oneUnguessedPlayer, pname: unguessed[0].playerName, points: $scope.unguessedPoints * 2}));
						$log.log(unguessed[0].playerName + ' only unguessed');
						//assigns points for single unguessed player
						playerHandler.assignPoints({playerId: unguessed[0].playerId, points: $scope.unguessedPoints * 2});
						$timeout(()=>{deferred.resolve();}, $scope.responseTime);
						return deferred.promise;
					});
				}
				//no unguessed players
				else{
					$q.when()
					.then(()=>{
						let deferred = $q.defer();
						//posts message for nobody unguessed
						$scope.guessLine.push(messageProvider.getMessage({messageName: messageNames.noUnguessed}));
						$log.log('no unguessed');
						elem.html(template);
						$timeout(()=>{deferred.resolve();}, $scope.responseTime);
						return deferred.promise;
					});
				}
			}
			//returns the amount of time to delay for unguessed players
			let unguessedTime = (unguessed) => {
				let time = 0;
				time += $scope.responseTime * 2;
				return time;
			}
		}];
		var template = '<md-list flex="60">'+
			'<md-list-item class="md-1-line" class="contentDetail" ng-repeat="line in messageLine"><p>{{line}}</p></md-list-item>'+
			'<md-list-item class="md-1-line" class="contentDetail" ng-repeat="line in responseLine"><md-card>{{line}}</md-card></md-list-item>'+
			'<md-list-item class="md-1-line" class="contentDetail" ng-repeat="line in detailLine"><p>{{line}}</p></md-list-item>'+
			'<md-list-item class="md-1-line" class="contentDetail" ng-repeat="line in guessLine"><p>{{line}}</p></md-list-item>'+
			'<md-list-item class="md-1-line" class="contentDetail" ng-repeat="line in subMessageLine"><p>{{line}}</p></md-list-item>'+
			'</md-list>';
		// let template;
    // let saveTemplate;
		// let messageLine[];
		// let detailLine[];
		// let guessLine[];
		// let subMessageLine[];
    // let responseTime = 3000;
    // let guessTime = 2000;
    // let correctGuessTime = 4000;
    // let baseGuessPoints = 10;
    // let unguessedPoints = 5;
		// let temp=
    return {
			restrict: 'A',
			scope: {
				guesses: '=guesses'
			},
			controller: controller,
			template: template
		};
    //   link: (scope, elem, attrs) => {
    //     let rightGuesses=scope.guesses.guessedRight;
    //     let wrongGuesses=scope.guesses.guessedWrong;
		//
    //     let wrongGuessResolve = (wrongGuesses, guessIndex) =>{
    //       if(wrongGuesses.length>0){
    //         $q.when()
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           $log.log("guess: " + wrongGuesses[guessIndex].response + " with " + wrongGuesses[guessIndex].guessers.length + " guessers");
    //           template = saveTemplate;
    //           template += messageProvider.getMessage({messageName: messageNames.guessedWrong, resp: wrongGuesses[guessIndex].response});
    //           elem.html(template);
    //           $timeout(()=>{deferred.resolve()},responseTime);
    //           return deferred.promise;
    //         })
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           wrongGuesserResolve(wrongGuesses[guessIndex].guessers, 0);
    //           $timeout(()=>{deferred.resolve()},guessTime*wrongGuesses[guessIndex].guessers.length);
    //           return deferred.promise;
    //         })
    //         .then(()=>{
    //           let deferred = $q.defer();
    //             if(guessIndex + 1 !== wrongGuesses.length)
    //               return wrongGuessResolve(wrongGuesses, guessIndex + 1);
    //             else
    //               return deferred.promise;
    //         });
    //       }
    //       else{
    //         template += messageProvider.getMessage({messageName: messageNames.noWrongGuesses});
    //         $log.log('no wrong guesses');
    //         elem.html(template);
    //         let deferred = $q.defer();
    //         return deferred.promise;
    //       }
    //     }
    //     let wrongGuesserResolve = (wrongGuessers, guesserIndex) => {
    //       $q.when()
    //       .then(()=>{
    //         let deferred = $q.defer();
    //         $log.log("guesser: " + wrongGuessers[guesserIndex].guesser);
    //         template += messageProvider.getMessage({messageName: messageNames.wrongGuess, pname: wrongGuessers[guesserIndex].guesser, pname2: wrongGuessers[guesserIndex].guessedWriter});
    //         elem.html(template);
    //         $timeout(()=>{deferred.resolve();}, guessTime);
    //         return deferred.promise;
    //       })
    //       .then(()=>{
    //         let deferred = $q.defer();
    //         if(guesserIndex + 1 !== wrongGuessers.length)
    //           return wrongGuesserResolve(wrongGuessers, guesserIndex + 1);
    //         else{
    //           $timeout(()=>{deferred.resolve();}, (wrongGuessers.length-1) * responseTime);
    //           return deferred.promise;
    //         }
    //       })
    //       .then(()=>{
    //         let deferred = $q.defer();
    //         return deferred.promise;
    //       });
    //     }
    //     let wrongGuessTime = ()=>{
    //       let time = 0;
    //       if(wrongGuesses.length>0){
    //         _.each(wrongGuesses, (wrongGuess) => {
    //          time += wrongGuess.guessers.length * responseTime;
    //         });
    //         time += wrongGuesses.length * guessTime;
    //       }
    //       time += responseTime;
    //       return time;
    //     }
    //     let rightGuessResolve = (rightGuesses, guessIndex) => {
    //       if(rightGuesses.length>0){
    //         $q.when()
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           template = saveTemplate;
    //           template += messageProvider.getMessage({messageName: messageNames.guessedRight, resp: rightGuesses[guessIndex].response, pname: rightGuesses[guessIndex].writer});
    //           elem.html(template);
    //           $log.log(rightGuesses[guessIndex].writer + ' was guessed by ' + rightGuesses[guessIndex].guessers.length + ' people');
    //           playerHandler.playerGuessed({playerId: rightGuesses[guessIndex].writerId});
    //           $timeout(()=>{deferred.resolve()}, responseTime);
    //           return deferred.promise;
    //         })
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           rightGuesserResolve(rightGuesses[guessIndex].guessers, 0);
    //           $timeout(()=>{deferred.resolve()}, correctGuessTime*rightGuesses[guessIndex].guessers.length);
    //           return deferred.promise;
    //         })
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           if(guessIndex + 1 !== rightGuesses.length)
    //             return rightGuessResolve(rightGuesses, guessIndex + 1);
    //           else
    //             return deferred.promise;
    //         });
    //       }
    //       else{
    //         template += messageProvider.getMessage({messageName: messageNames.noRightGuesses});
    //         $log.log('no right guesses');
    //         elem.html(template);
    //         let deferred = $q.defer();
    //         return deferred.promise;
    //       }
    //     }
    //     let rightGuesserResolve = (rightGuessers, guesserIndex) => {
    //       if(rightGuessers.length>0){
    //         $q.when()
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           template += messageProvider.getMessage({messageName: messageNames.rightGuesser, pname: rightGuessers[guesserIndex].guesser});
    //           elem.html(template);
    //           $log.log(rightGuessers[guesserIndex].guesser + ' guessed it');
    //           $timeout(()=>{deferred.resolve()}, guessTime);
    //           return deferred.promise;
    //         })
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           if(guesserIndex + 1 !== rightGuessers.length)
    //             rightGuesserResolve(rightGuessers, guesserIndex+1);
    //           else{
    //             $timeout(()=>{deferred.resolve()}, (rightGuessers.length-1)*guessTime);
    //             return deferred.promise;
    //           }
    //         })
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           if(rightGuessers.length === guesserIndex +1){
    //             let points = Math.floor(baseGuessPoints/rightGuessers.length)
    //             if(rightGuessers.length === 1)
    //               template += messageProvider.getMessage({messageName: messageNames.oneRightGuesser, points: points});
    //             else {
    //               template += messageProvider.getMessage({messageName: messageNames.multiRightGuessers, points: points});
    //             }
    //             elem.html(template);
    //             _.each(rightGuessers, (rightGuesser) => {
    //               playerHandler.assignPoints({playerId: rightGuesser.guesserId, points: points});
    //             });
    //             $timeout(()=>{deferred.resolve()}, guessTime*rightGuesses.length);
    //             return deferred.promise;
    //           }
    //           else {
    //             return deferred.promise;
    //           }
    //         });
    //       }
    //       else {
    //         let deferred = $q.defer();
    //         return referred.promise;
    //       }
    //     }
    //     let rightGuessTime = ()=>{
    //       let time = 0;
    //       if(rightGuesses.length>0){
    //         _.each(rightGuesses, (rightGuess) => {
    //           time += rightGuess.guessers.length * responseTime;
    //         });
    //         time += rightGuesses.length * correctGuessTime;
    //       }
    //       time += responseTime;
    //       return time;
    //     }
    //     let unguessedResolve = (unguessed, unguessedIndex) => {
    //       if(unguessed.length>1){
    //         $q.when()
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           template += messageProvider.getMessage({messageName: messageNames.unguessedPlayer, pname: unguessed[unguessedIndex].playerName, points:  unguessedPoints});
    //           $log.log(unguessed[unguessedIndex].playerName + ' unguessed');
    //           elem.html(template);
    //           playerHandler.assignPoints({playerId: unguessed[unguessedIndex].playerId, points: unguessedPoints});
    //           $timeout(()=>{deferred.resolve();}, responseTime);
    //           return deferred.promise;
    //         })
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           if(unguessedIndex +1 !== unguessed.length)
    //             return unguessedResolve(unguessed, unguessedIndex + 1);
    //           else {
    //             return deferred.promise;
    //           }
    //         });
    //       }
    //       else if(unguessed.length === 1){
    //         $q.when()
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           template += messageProvider.getMessage({messageName: messageNames.oneUnguessedPlayer, pname: unguessed[0].playerName, points: unguessedPoints * 2});
    //           $log.log(unguessed[0].playerName + ' only unguessed');
    //           playerHandler.assignPoints({playerId: unguessed[0].playerId, points: unguessedPoints * 2});
    //           elem.html(template);
    //           $timeout(()=>{deferred.resolve();},responseTime);
    //           return deferred.promise;
    //         });
    //       }
    //       else{
    //         $q.when()
    //         .then(()=>{
    //           let deferred = $q.defer();
    //           template += messageProvider.getMessage({messageName: messageNames.noUnguessed});
    //           $log.log('no unguessed');
    //           elem.html(template);
    //           $timeout(()=>{deferred.resolve();},responseTime);
    //           return deferred.promise;
    //         });
    //       }
    //     }
    //     let unguessedTime = (unguessed) => {
    //       let time = 0;
    //       if(unguessed.length>0)
    //         time += unguessed.length*responseTime;
    //       time += responseTime;
    //       return time;
    //     }
    //     //core logic for the guess results render
    //     $q.when()
    //     .then(()=>{
    //       let deferred = $q.defer();
    //       template = messageProvider.getMessage({messageName: messageNames.wrongDisplay});
    //       elem.html(template);
    //       saveTemplate = template;
    //       $timeout(()=>{deferred.resolve();},responseTime);
    //       return deferred.promise;
    //     })
    //     .then(()=>{
    //       let deferred = $q.defer();
    //       $timeout(()=>{deferred.resolve();},wrongGuessTime());
    //       wrongGuessResolve(wrongGuesses,0);
    //       return deferred.promise;
    //     })
    //     .then(()=>{
    //       let deferred = $q.defer();
    //       template = messageProvider.getMessage({messageName: messageNames.rightDisplay});
    //       saveTemplate = template;
    //       elem.html(template);
    //       $timeout(()=>{deferred.resolve();},responseTime);
    //       return deferred.promise;
    //     })
    //     .then(()=>{
    //       let deferred = $q.defer();
    //       $timeout(()=>{deferred.resolve();},rightGuessTime());
    //       rightGuessResolve(rightGuesses,0);
    //       return deferred.promise;
    //     })
    //     .then(()=>{
    //       let deferred = $q.defer();
    //       template = messageProvider.getMessage({messageName: messageNames.unguessedDisplay});
    //       elem.html(template);
    //       $timeout(()=>{deferred.resolve();},responseTime);
    //       return deferred.promise;
    //     })
    //     .then(()=>{
    //       let deferred = $q.defer();
    //       let unguessed = playerHandler.getElegiblePlayers();
    //       $timeout(()=>{deferred.resolve();}, unguessedTime(unguessed));
    //       unguessedResolve(unguessed, 0);
    //       return deferred.promise;
    //     })
    //     .then(()=>{
    //       let deferred = $q.defer();
    //       template = playerHandler.unguessedPlayers() ? messageProvider.getMessage({messageName: messageNames.moreGuessing}) : messageProvider.getMessage({messageName: messageNames.allGuessed});
    //       elem.html(template);
    //       $timeout(()=>{deferred.resolve();}, correctGuessTime);
    //       return deferred.promise;
    //     })
    //     .then(()=>{
    //       eventService.publish(gameEvents.guessesResolved, "");
    //     });
    //   }
		// };
	});
}
