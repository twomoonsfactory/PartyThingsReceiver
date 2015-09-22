export default ngModule => {
	ngModule.directive('guessesSorted', ['$log', '$q', '$interval', 'playerHandler', 'eventService', 'gameEvents', '$timeout', 'messageProvider', 'messageNames', ($log, $q, $interval, playerHandler, eventService, gameEvents, $timeout, messageProvider, messageNames)=>{
		let template;
    let saveTemplate;
    let responseTime = 3000;
    let guessTime = 2000;
    let correctGuessTime = 4000;
    let baseGuessPoints = 10;
    let unguessedPoints = 5;
    return {
			restrict: 'A',
			scope: {
				guesses: '=guesses'
			},
      link: (scope, elem, attrs) => {
        let rightGuesses=scope.guesses.guessedRight;
        let wrongGuesses=scope.guesses.guessedWrong;

        let wrongGuessResolve = (wrongGuesses, guessIndex) =>{
          if(wrongGuesses.length>0){
            $q.when()
            .then(()=>{
              let deferred = $q.defer();
              $log.log("guess: " + wrongGuesses[guessIndex].response + " with " + wrongGuesses[guessIndex].guessers.length + " guessers");
              template = saveTemplate;
              template += messageProvider.getMessage({messageName: messageNames.guessedWrong, resp: wrongGuesses[guessIndex].response});
              elem.html(template);
              $timeout(()=>{deferred.resolve()},responseTime);
              return deferred.promise;
            })
            .then(()=>{
              let deferred = $q.defer();
              wrongGuesserResolve(wrongGuesses[guessIndex].guessers, 0);
              $timeout(()=>{deferred.resolve()},guessTime*wrongGuesses[guessIndex].guessers.length);
              return deferred.promise;
            })
            .then(()=>{
              let deferred = $q.defer();
                if(guessIndex + 1 !== wrongGuesses.length)
                  return wrongGuessResolve(wrongGuesses, guessIndex + 1);
                else
                  return deferred.promise;
            });
          }
          else{
            template += messageProvider.getMessage({messageName: messageNames.noWrongGuesses});
            $log.log('no wrong guesses');
            elem.html(template);
            let deferred = $q.defer();
            return deferred.promise;
          }
        }
        let wrongGuesserResolve = (wrongGuessers, guesserIndex) => {
          $q.when()
          .then(()=>{
            let deferred = $q.defer();
            $log.log("guesser: " + wrongGuessers[guesserIndex].guesser);
            template += messageProvider.getMessage({messageName: messageNames.wrongGuess, pname: wrongGuessers[guesserIndex].guesser, pname2: wrongGuessers[guesserIndex].guessedWriter});
            elem.html(template);
            $timeout(()=>{deferred.resolve();}, guessTime);
            return deferred.promise;
          })
          .then(()=>{
            let deferred = $q.defer();
            if(guesserIndex + 1 !== wrongGuessers.length)
              return wrongGuesserResolve(wrongGuessers, guesserIndex + 1);
            else{
              $timeout(()=>{deferred.resolve();}, (wrongGuessers.length-1) * responseTime);
              return deferred.promise;
            }
          })
          .then(()=>{
            let deferred = $q.defer();
            return deferred.promise;
          });
        }
        let wrongGuessTime = ()=>{
          let time = 0;
          if(wrongGuesses.length>0){
            _.each(wrongGuesses, (wrongGuess) => {
             time += wrongGuess.guessers.length * responseTime;
            });
            time += wrongGuesses.length * guessTime;
          }
          time += responseTime;
          return time;
        }
        let rightGuessResolve = (rightGuesses, guessIndex) => {
          if(rightGuesses.length>0){
            $q.when()
            .then(()=>{
              let deferred = $q.defer();
              template = saveTemplate;
              template += messageProvider.getMessage({messageName: messageNames.guessedRight, resp: rightGuesses[guessIndex].response, pname: rightGuesses[guessIndex].writer});
              elem.html(template);
              $log.log(rightGuesses[guessIndex].writer + ' was guessed by ' + rightGuesses[guessIndex].guessers.length + ' people');
              playerHandler.playerGuessed({playerId: rightGuesses[guessIndex].writerId});
              $timeout(()=>{deferred.resolve()}, responseTime);
              return deferred.promise;
            })
            .then(()=>{
              let deferred = $q.defer();
              rightGuesserResolve(rightGuesses[guessIndex].guessers, 0);
              $timeout(()=>{deferred.resolve()}, correctGuessTime*rightGuesses[guessIndex].guessers.length);
              return deferred.promise;
            })
            .then(()=>{
              let deferred = $q.defer();
              if(guessIndex + 1 !== rightGuesses.length)
                return rightGuessResolve(rightGuesses, guessIndex + 1);
              else
                return deferred.promise;
            });
          }
          else{
            template += messageProvider.getMessage({messageName: messageNames.noRightGuesses});
            $log.log('no right guesses');
            elem.html(template);
            let deferred = $q.defer();
            return deferred.promise;
          }
        }
        let rightGuesserResolve = (rightGuessers, guesserIndex) => {
          if(rightGuessers.length>0){
            $q.when()
            .then(()=>{
              let deferred = $q.defer();
              template += messageProvider.getMessage({messageName: messageNames.rightGuesser, pname: rightGuessers[guesserIndex].guesser});
              elem.html(template);
              $log.log(rightGuessers[guesserIndex].guesser + ' guessed it');
              $timeout(()=>{deferred.resolve()}, guessTime);
              return deferred.promise;
            })
            .then(()=>{
              let deferred = $q.defer();
              if(guesserIndex + 1 !== rightGuessers.length)
                rightGuesserResolve(rightGuessers, guesserIndex+1);
              else{
                $timeout(()=>{deferred.resolve()}, (rightGuessers.length-1)*guessTime);
                return deferred.promise;
              }
            })
            .then(()=>{
              let deferred = $q.defer();
              if(rightGuessers.length === guesserIndex +1){
                let points = Math.floor(baseGuessPoints/rightGuessers.length)
                if(rightGuessers.length === 1)
                  template += messageProvider.getMessage({messageName: messageNames.oneRightGuesser, points: points});
                else {
                  template += messageProvider.getMessage({messageName: messageNames.multiRightGuessers, points: points});
                }
                elem.html(template);
                _.each(rightGuessers, (rightGuesser) => {
                  playerHandler.assignPoints({playerId: rightGuesser.guesserId, points: points});
                });
                $timeout(()=>{deferred.resolve()}, guessTime*rightGuesses.length);
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
        let rightGuessTime = ()=>{
          let time = 0;
          if(rightGuesses.length>0){
            _.each(rightGuesses, (rightGuess) => {
              time += rightGuess.guessers.length * responseTime;
            });
            time += rightGuesses.length * correctGuessTime;
          }
          time += responseTime;
          return time;
        }
        let unguessedResolve = (unguessed, unguessedIndex) => {
          if(unguessed.length>1){
            $q.when()
            .then(()=>{
              let deferred = $q.defer();
              template += messageProvider.getMessage({messageName: messageNames.unguessedPlayer, pname: unguessed[unguessedIndex].playerName, points:  unguessedPoints});
              $log.log(unguessed[unguessedIndex].playerName + ' unguessed');
              elem.html(template);
              playerHandler.assignPoints({playerId: unguessed[unguessedIndex].playerId, points: unguessedPoints});
              $timeout(()=>{deferred.resolve();}, responseTime);
              return deferred.promise;
            })
            .then(()=>{
              let deferred = $q.defer();
              if(unguessedIndex +1 !== unguessed.length)
                return unguessedResolve(unguessed, unguessedIndex + 1);
              else {
                return deferred.promise;
              }
            });
          }
          else if(unguessed.length === 1){
            $q.when()
            .then(()=>{
              let deferred = $q.defer();
              template += messageProvider.getMessage({messageName: messageNames.oneUnguessedPlayer, pname: unguessed[0].playerName, points: unguessedPoints * 2});
              $log.log(unguessed[0].playerName + ' only unguessed');
              playerHandler.assignPoints({playerId: unguessed[0].playerId, points: unguessedPoints * 2});
              elem.html(template);
              $timeout(()=>{deferred.resolve();},responseTime);
              return deferred.promise;
            });
          }
          else{
            $q.when()
            .then(()=>{
              let deferred = $q.defer();
              template += messageProvider.getMessage({messageName: messageNames.noUnguessed});
              $log.log('no unguessed');
              elem.html(template);
              $timeout(()=>{deferred.resolve();},responseTime);
              return deferred.promise;
            });
          }
        }
        let unguessedTime = (unguessed) => {
          let time = 0;
          if(unguessed.length>0)
            time += unguessed.length*responseTime;
          time += responseTime;
          return time;
        }
        //core logic for the guess results render
        $q.when()
        .then(()=>{
          let deferred = $q.defer();
          template = messageProvider.getMessage({messageName: messageNames.wrongDisplay});
          elem.html(template);
          saveTemplate = template;
          $timeout(()=>{deferred.resolve();},responseTime);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = $q.defer();
          $timeout(()=>{deferred.resolve();},wrongGuessTime());
          wrongGuessResolve(wrongGuesses,0);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = $q.defer();
          template = messageProvider.getMessage({messageName: messageNames.rightDisplay});
          saveTemplate = template;
          elem.html(template);
          $timeout(()=>{deferred.resolve();},responseTime);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = $q.defer();
          $timeout(()=>{deferred.resolve();},rightGuessTime());
          rightGuessResolve(rightGuesses,0);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = $q.defer();
          template = messageProvider.getMessage({messageName: messageNames.unguessedDisplay});
          elem.html(template);
          $timeout(()=>{deferred.resolve();},responseTime);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = $q.defer();
          let unguessed = playerHandler.getElegiblePlayers();
          $timeout(()=>{deferred.resolve();}, unguessedTime(unguessed));
          unguessedResolve(unguessed, 0);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = $q.defer();
          template = playerHandler.unguessedPlayers() ? messageProvider.getMessage({messageName: messageNames.moreGuessing}) : messageProvider.getMessage({messageName: messageNames.allGuessed});
          elem.html(template);
          $timeout(()=>{deferred.resolve();}, correctGuessTime);
          return deferred.promise;
        })
        .then(()=>{
          eventService.publish(gameEvents.guessesResolved, "");
        });
      }
		};
	}]);
}
