export default ngModule => {
  ngModule.directive('playerGuessDisplay', ['$rootScope', '$q', '$timeout', 'gameEvents', 'gameNumbers', ($rootScope, $q, $timeout, gameEvents, gameNumbers)=>{
    return{
      restrict: 'A',
      scope:{
        player: "=playerGuessDisplay"
      },
      link: (scope, elem, attrs)=>{
        scope.wasGuessed = false;
        scope.checkIfGuessed = (prompt)=>{
          //checks if this player was guessed correctly for the current prompt, returns true if so, otherwise false
          if(prompt.playerId===scope.player.playerId && prompt.correct.length > 0){
            scope.animateGuess(true);
            scope.wasGuessed = true;
            return true;
          }
          //checks if this player was incorrectly guessed
          else if(_.findWhere(prompt.incorrect, {guessedWriter: scope.player.playerId}))
            scope.animateGuess(false);
          return false;
        }

        //checks if this player guessed the response correctly, returns true if so, otherwise false
        scope.checkIfScored = (prompt)=>{
          if(_.findWhere(prompt.correct, {guesser: scope.player.playerId}))
            return true;
          return false;
        }

        //adds points for a correct guess;
        scope.addPoints = (points)=>{
          scope.player.addScore(points);
        }

        scope.checkIfUnguessed = ()=>{
          if(!scope.player.guessed)
            return true;
        }

        scope.animateGuess = (right)=>{
          let timeUntilFinal = 3500;
          $q.when()
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('cardHue').addClass('beingGuessed guessMid');
            $timeout(()=>{defer.resolve()}, timeUntilFinal/9);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('guessMid').addClass('guess1');
            $timeout(()=>{defer.resolve()}, timeUntilFinal/9);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('guess1').addClass('guessMid');
            $timeout(()=>{defer.resolve()}, timeUntilFinal/9);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('guessMid').addClass('guess2');
            $timeout(()=>{defer.resolve()}, timeUntilFinal/9);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('guess2').addClass('guessMid');
            $timeout(()=>{defer.resolve()}, timeUntilFinal/9);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('guessMid').addClass('guess1');
            $timeout(()=>{defer.resolve()}, timeUntilFinal/9);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('guess1').addClass('guessMid');
            $timeout(()=>{defer.resolve()}, timeUntilFinal/9);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('guessMid').addClass('guess2');
            $timeout(()=>{defer.resolve()}, timeUntilFinal/9);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('guess2').addClass('guessMid');
            $timeout(()=>{defer.resolve()}, timeUntilFinal/9);
            return defer.promise;
          })
          .then(()=>{
            elem.removeClass('guessMid guess2').addClass(right ? 'guessRight' : 'guessWrong');
          });
        }

        //returns the player slip to the proper state
        scope.resolveAnimation = ()=>{
          elem.removeClass('beingGuessed guessRight guessWrong');
          elem.addClass('cardHue');
          if(scope.wasGuessed)scope.player.wasGuessed();
          scope.wasGuessed = false;
        }

        scope.setCardState = ()=>{
          if(scope.player.waitingForAction>0) elem.removeClass('supressed ready').addClass('readyToAct');
          else if(scope.player.waitingForAction<0) elem.removeClass('readyToAct ready').addClass('supressed');
          else elem.removeClass('readyToAct supressed').addClass('ready');
          if(scope.player.guessed||scope.player.standingBy) elem.addClass('inactive');
          else elem.removeClass('inactive');
        }

        scope.$watch('player.waitingForAction', scope.setCardState);
        scope.$watch('player.guessed', scope.setCardState);

        $rootScope.$emit(gameEvents.playerRegistered, scope);
      }
    };
  }])
}
