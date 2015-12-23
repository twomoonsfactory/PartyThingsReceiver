export default ngModule => {
  ngModule.directive('playerGuessDisplay', ['$rootScope', '$q', '$timeout', 'gameEvents', 'playerStates', 'gameNumbers', ($rootScope, $q, $timeout, gameEvents, playerStates, gameNumbers)=>{
    return{
      restrict: 'A',
      scope:{
        player: "=playerGuessDisplay"
      },
      link: (scope, elem, attrs)=>{
        scope.wasGuessed = false;
        scope.thisPlayerQuit = false;
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

          $q.when()
          .then(()=>{
            let defer = $q.defer();
            if(elem.hasClass('supressed')){
              scope.thisPlayerQuit = true;
              elem.removeClass('supressed').addClass('inactive');
            }
            elem.removeClass('cardHue').addClass('beingGuessed guessMid');
            $timeout(()=>{defer.resolve()}, gameNumbers.guessDisplayTime);
            return defer.promise;
          })
          .then(()=>{
            elem.removeClass('guessMid').addClass(right ? 'guessRight' : 'guessWrong');
          });
        }

        scope.updateScreen = ()=>{
          $timeout(()=>{
            scope.$apply();
          });
        }

        //returns the player slip to the proper state
        scope.resolveAnimation = ()=>{
          elem.removeClass('beingGuessed guessRight guessWrong');
          elem.addClass('cardHue');
          if(scope.wasGuessed)scope.player.wasGuessed();
          if(scope.thisPlayerQuit)elem.addClass('supressed');
          scope.wasGuessed = false;
          scope.thisPlayerQuit = false;
          scope.updateScreen();
        }

        scope.setCardState = ()=>{
          if(scope.player.waitingForAction>0) elem.removeClass('supressed ready').addClass('readyToAct');
          else if(scope.player.waitingForAction<0) elem.removeClass('readyToAct ready').addClass('supressed');
          else elem.removeClass('readyToAct supressed').addClass('ready');
          if(scope.player.guessed) elem.addClass('inactive');
          else if(scope.player.checkState(playerStates.standingBy)) elem.addClass('standby');
          else elem.removeClass('inactive standby');
          scope.updateScreen();
        }

        scope.setCardState();

        scope.$watch('player.waitingForAction', scope.setCardState);
        scope.$watch('player.guessed', scope.setCardState);

        $rootScope.$emit(gameEvents.playerRegistered, scope);
      }
    };
  }])
}
