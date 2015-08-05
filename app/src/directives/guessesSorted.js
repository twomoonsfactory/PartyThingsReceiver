module.exports = function($log, $q, $interval, playerHandler, eventService, gameEvents, $timeout, messageProvider, messageNames){
		var template;
    var saveTemplate;
    var responseTime = 3000;
    var guessTime = 2000;
    var correctGuessTime = 4000;
    var baseGuessPoints = 10;
    var unguessedPoints = 5;
    return {
			restrict: 'A',
			scope: {
				guesses: '=guesses'
			},
      link: function(scope, elem, attrs){
        var rightGuesses=scope.guesses.guessedRight;
        var wrongGuesses=scope.guesses.guessedWrong;

        var wrongGuessResolve = function(wrongGuesses, guessIndex){
          if(wrongGuesses.length>0){
            $q.when()
            .then(function(){
              var deferred = $q.defer();
              $log.log("guess: " + wrongGuesses[guessIndex].response + " with " + wrongGuesses[guessIndex].guessers.length + " guessers");
              template = saveTemplate;
              template += messageProvider.getMessage({messageName: messageNames.guessedWrong, resp: wrongGuesses[guessIndex].response});
              elem.html(template);
              $timeout(function(){deferred.resolve()},responseTime);
              return deferred.promise;
            })
            .then(function(){
              var deferred = $q.defer();
              wrongGuesserResolve(wrongGuesses[guessIndex].guessers, 0);
              $timeout(function(){deferred.resolve()},guessTime*wrongGuesses[guessIndex].guessers.length);
              return deferred.promise;
            })
            .then(function(){
              var deferred = $q.defer();
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
            var deferred = $q.defer();
            return deferred.promise;
          }
        }
        var wrongGuesserResolve = function(wrongGuessers, guesserIndex){
          $q.when()
          .then(function(){
            var deferred = $q.defer();
            $log.log("guesser: " + wrongGuessers[guesserIndex].guesser);
            template += messageProvider.getMessage({messageName: messageNames.wrongGuess, pname: wrongGuessers[guesserIndex].guesser, pname2: wrongGuessers[guesserIndex].guessedWriter});
            elem.html(template);
            $timeout(function(){deferred.resolve();}, guessTime);
            return deferred.promise;
          })
          .then(function(){
            var deferred = $q.defer();
            if(guesserIndex + 1 !== wrongGuessers.length)
              return wrongGuesserResolve(wrongGuessers, guesserIndex + 1);
            else{
              $timeout(function(){deferred.resolve();}, (wrongGuessers.length-1) * responseTime);
              return deferred.promise;
            }
          })
          .then(function(){
            var deferred = $q.defer();
            return deferred.promise;
          });
        }
        var wrongGuessTime = function(){
          var time = 0;
          if(wrongGuesses.length>0){
            _.each(wrongGuesses, function(wrongGuess){
             time += wrongGuess.guessers.length * responseTime;
            });
            time += wrongGuesses.length * guessTime;
          }
          time += responseTime;
          return time;
        }
        var rightGuessResolve = function(rightGuesses, guessIndex){
          if(rightGuesses.length>0){
            $q.when()
            .then(function(){
              var deferred = $q.defer();
              template = saveTemplate;
              template += messageProvider.getMessage({messageName: messageNames.guessedRight, resp: rightGuesses[guessIndex].response, pname: rightGuesses[guessIndex].writer});
              elem.html(template);
              $log.log(rightGuesses[guessIndex].writer + ' was guessed by ' + rightGuesses[guessIndex].guessers.length + ' people');
              playerHandler.playerGuessed({playerId: rightGuesses[guessIndex].writerId});
              $timeout(function(){deferred.resolve()}, responseTime);
              return deferred.promise;
            })
            .then(function(){
              var deferred = $q.defer();
              rightGuesserResolve(rightGuesses[guessIndex].guessers, 0);
              $timeout(function(){deferred.resolve()}, correctGuessTime*rightGuesses[guessIndex].guessers.length);
              return deferred.promise;
            })
            .then(function(){
              var deferred = $q.defer();
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
            var deferred = $q.defer();
            return deferred.promise;
          }
        }
        var rightGuesserResolve = function(rightGuessers, guesserIndex){
          if(rightGuessers.length>0){
            $q.when()
            .then(function(){
              var deferred = $q.defer();
              template += messageProvider.getMessage({messageName: messageNames.rightGuesser, pname: rightGuessers[guesserIndex].guesser});
              elem.html(template);
              $log.log(rightGuessers[guesserIndex].guesser + ' guessed it');
              $timeout(function(){deferred.resolve()}, guessTime);
              return deferred.promise;
            })
            .then(function(){
              var deferred = $q.defer();
              if(guesserIndex + 1 !== rightGuessers.length)
                rightGuesserResolve(rightGuessers, guesserIndex+1);
              else{
                $timeout(function(){deferred.resolve()}, (rightGuessers.length-1)*guessTime);
                return deferred.promise;
              }
            })
            .then(function(){
              var deferred = $q.defer();
              if(rightGuessers.length === guesserIndex +1){
                var points = Math.floor(baseGuessPoints/rightGuessers.length)
                if(rightGuessers.length === 1)
                  template += messageProvider.getMessage({messageName: messageNames.oneRightGuesser, points: points});
                else {
                  template += messageProvider.getMessage({messageName: messageNames.multiRightGuessers, points: points});
                }
                elem.html(template);
                _.each(rightGuessers, function(rightGuesser){
                  playerHandler.assignPoints({playerId: rightGuesser.guesserId, points: points});
                });
                $timeout(function(){deferred.resolve()}, guessTime*rightGuesses.length);
                return deferred.promise;
              }
              else {
                return deferred.promise;
              }
            });
          }
          else {
            var deferred = $q.defer();
            return referred.promise;
          }
        }
        var rightGuessTime = function(){
          var time = 0;
          if(rightGuesses.length>0){
            _.each(rightGuesses, function(rightGuess){
              time += rightGuess.guessers.length * responseTime;
            });
            time += rightGuesses.length * correctGuessTime;
          }
          time += responseTime;
          return time;
        }
        var unguessedResolve = function(unguessed, unguessedIndex){
          if(unguessed.length>1){
            $q.when()
            .then(function(){
              var deferred = $q.defer();
              template += messageProvider.getMessage({messageName: messageNames.unguessedPlayer, pname: unguessed[unguessedIndex].playerName, points:  unguessedPoints});
              $log.log(unguessed[unguessedIndex].playerName + ' unguessed');
              elem.html(template);
              playerHandler.assignPoints({playerId: unguessed[unguessedIndex].playerId, points: unguessedPoints});
              $timeout(function(){deferred.resolve();}, responseTime);
              return deferred.promise;
            })
            .then(function(){
              var deferred = $q.defer();
              if(unguessedIndex +1 !== unguessed.length)
                return unguessedResolve(unguessed, unguessedIndex + 1);
              else {
                return deferred.promise;
              }
            });
          }
          else if(unguessed.length === 1){
            $q.when()
            .then(function(){
              var deferred = $q.defer();
              template += messageProvider.getMessage({messageName: messageNames.oneUnguessedPlayer, pname: unguessed[0].playerName, points: unguessedPoints * 2});
              $log.log(unguessed[0].playerName + ' only unguessed');
              playerHandler.assignPoints({playerId: unguessed[0].playerId, points: unguessedPoints * 2});
              elem.html(template);
              $timeout(function(){deferred.resolve();},responseTime);
              return deferred.promise;
            });
          }
          else{
            $q.when()
            .then(function(){
              var deferred = $q.defer();
              template += messageProvider.getMessage({messageName: messageNames.noUnguessed});
              $log.log('no unguessed');
              elem.html(template);
              $timeout(function(){deferred.resolve();},responseTime);
              return deferred.promise;
            });
          }
        }
        var unguessedTime = function(unguessed){
          var time = 0;
          if(unguessed.length>0)
            time += unguessed.length*responseTime;
          time += responseTime;
          return time;
        }
        //core logic for the guess results render
        $q.when()
        .then(function(){
          var deferred = $q.defer();
          template = messageProvider.getMessage({messageName: messageNames.wrongDisplay});
          elem.html(template);
          saveTemplate = template;
          $timeout(function(){deferred.resolve();},responseTime);
          return deferred.promise;
        })
        .then(function(){
          var deferred = $q.defer();
          $timeout(function(){deferred.resolve();},wrongGuessTime());
          wrongGuessResolve(wrongGuesses,0);
          return deferred.promise;
        })
        .then(function(){
          var deferred = $q.defer();
          template = messageProvider.getMessage({messageName: messageNames.rightDisplay});
          saveTemplate = template;
          elem.html(template);
          $timeout(function(){deferred.resolve();},responseTime);
          return deferred.promise;
        })
        .then(function(){
          var deferred = $q.defer();
          $timeout(function(){deferred.resolve();},rightGuessTime());
          rightGuessResolve(rightGuesses,0);
          return deferred.promise;
        })
        .then(function(){
          var deferred = $q.defer();
          template = messageProvider.getMessage({messageName: messageNames.unguessedDisplay});
          elem.html(template);
          $timeout(function(){deferred.resolve();},responseTime);
          return deferred.promise;
        })
        .then(function(){
          var deferred = $q.defer();
          var unguessed = playerHandler.getElegiblePlayers();
          $timeout(function(){deferred.resolve();}, unguessedTime(unguessed));
          unguessedResolve(unguessed, 0);
          return deferred.promise;
        })
        .then(function(){
          var deferred = $q.defer();
          template = playerHandler.unguessedPlayers() ? messageProvider.getMessage({messageName: messageNames.moreGuessing}) : messageProvider.getMessage({messageName: messageNames.allGuessed});
          elem.html(template);
          $timeout(function(){deferred.resolve();}, correctGuessTime);
          return deferred.promise;
        })
        .then(function(){
          eventService.publish(gameEvents.guessesResolved, "");
        });
      }
		};
	};
