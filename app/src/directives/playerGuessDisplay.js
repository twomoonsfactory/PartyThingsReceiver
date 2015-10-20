export default ngModule => {
  ngModule.directive('playerGuessDisplay', ['$rootScope', '$q', '$timeout', 'gameEvents', 'gameNumbers', ($rootScope, $q, $timeout, gameEvents, gameNumbers)=>{
    return{
      restrict: 'A',
      scope:{
        player: "=playerGuessDisplay"
      },
      link: (scope, elem, attrs)=>{

        scope.checkIfGuessed = (prompt)=>{
          //checks if this player was guessed correctly for the current prompt
          if(prompt.playerId===scope.player.playerId && prompt.correct.length > 0)
            scope.animateGuess(true);
          //checks if this player had guessed this prompt wrong
          else if(_.findWhere(prompt.incorrect, {guessedWriter: scope.player.playerId}))
            scope.animateGuess(false);
        }

        scope.checkIfScored = (prompt)=>{
          if(_.findWhere(prompt.correct, {guesser: scope.player.playerId}))
            scope.player.addScore(Math.floor(gameNumbers.guessScore/prompt.correct.length));
        }

        scope.checkIfUnguessed = ()=>{
          if(!scope.player.guessed)
            scope.player.addScore(gameNumbers.unguessedScore);
        }

        scope.animateGuess = (right)=>{
          $q.when()
          .then(()=>{
            let defer = $q.defer();
            elem.addClass('beingGuessed guess1');
            $timeout(()=>{defer.resolve()}, 500);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.addClass('guessMid');
            $timeout(()=>{defer.resolve()}, 500);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('guessMid guess1').addClass('guess2');
            $timeout(()=>{defer.resolve()}, 500);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.addClass('guessMid');
            $timeout(()=>{defer.resolve()}, 500);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('guessMid guess2').addClass(right ? 'guessRight' : 'guessWrong');
            $timeout(()=>{defer.resolve()}, 1000);
            return defer.promise;
          })
          .then(()=>{
            let defer = $q.defer();
            if(right)
              scope.player.wasGuessed();
            elem.removeClass('beingGuessed guessRight guessWrong');
            $timeout(()=>{defer.resolve()}, 500);
          });
        }

        // scope.updatePlayerStyle = ()=>{
        //   //sets initial styling of the tag
        //   if(scope.player.waitingForAction>0) //needs action
        //     elem.removeClass('supressed ready').addClass('readyToAct');
        //   else if(scope.player.waitingForAction<0) //guessed or quit or standingBy
        //     elem.removeClass('ready readyToAct').addClass('supressed');
        //   else //acted, ready for next state
        //     elem.removeClass('readyToAct supressed').addClass('ready');
        // }
        //
        // scope.updatePlayerStyle();
        // scope.$watch(scope.player, scope.updatePlayerStyle, true);
        // let trueColor;
        // let falseColor;
        // let unguessedColor;
        //   scope.checkIfGuessed = (guess)=>{
        //     //checks to see if the player is listed as a guessedWriter in the guess's "incorrect" list
        //     if(_.findWhere(guess.incorrect, {guessedWriter: scope.player.playerId})){
        //       scope.animateGuess(-1);
        //     }
        //     //checks to see if the player is a correcly guessed player
        //     else if(_.findWhere(guess.correct, {guessedWriter: scope.player.playerId})){
        //       scope.animateGuess(1);
        //     }
        //   };
        //   scope.animateGuess = (num)=>{
        //     //general animation if guessed
        //     $q.when()
        //     .then(()=>{
        //       let deferred = $q.defer();
        //       elem.css({
        //         '-webkit-transition' : 'all .5s',
        //         'backgroundColor' : 'green'
        //       });
        //       $timeout(()=>{deferred.resolve();}, 450);
        //       return deferred.promise;
        //     })
        //     .then(()=>{
        //       let deferred = $q.defer();
        //       elem.css({
        //         '-webkit-transition' : 'all .5s',
        //         'backgroundColor' : 'white'
        //       });
        //       $timeout(()=>{deferred.resolve();}, 450);
        //       return deferred.promise;
        //     })
        //     .then(()=>{
        //       let deferred = $q.defer();
        //       elem.css({
        //         '-webkit-transition' : 'all .5s',
        //         'backgroundColor' : 'red'
        //       });
        //       $timeout(()=>{deferred.resolve();}, 450);
        //       return deferred.promise;
        //     })
        //     .then(()=>{
        //       let deferred = $q.defer();
        //       elem.css({
        //         '-webkit-transition' : 'all .5s',
        //         'backgroundColor' : 'white'
        //       });
        //       $timeout(()=>{deferred.resolve();}, 450);
        //       return deferred.promise;
        //     });
        //     if(num===1){
        //       //animate for true guess
        //       $q.when()
        //       .then(()=>{
        //         let deferred = $q.defer();
        //         elem.css({
        //           '-webkit-transition' : 'all .1s',
        //           'backgroundColor' : 'green'
        //         });
        //         $timeout(()=>{deferred.resolve();}, 100);
        //         return deferred.promise;
        //       })
        //       .then(()=>{
        //         let deferred = $q.defer();
        //         //supressed class
        //         elem.addClass('supressed');
        //         $timeout(()=>{deferred.resolve();}, 50);
        //         return deferred.promise;
        //       })
        //       .then(()=>{
        //         let deferred = $q.defer();
        //         elem.css({
        //           '-webkit-transition' : 'all .05s',
        //           'backgroundColor' : 'white'
        //         });
        //         $timeout(()=>{deferred.resolve();}, 50);
        //         return deferred.promise;
        //       });
        //     }
        //     else if(num===-1){
        //       //animate for false guess
        //       $q.when()
        //       .then(()=>{
        //         let deferred = $q.defer();
        //         elem.css({
        //           '-webkit-transition' : 'all .15s',
        //           'backgroundColor' : 'red'
        //         });
        //         $timeout(()=>{deferred.resolve();}, 150);
        //         return deferred.promise;
        //       })
        //       .then(()=>{
        //         let deferred = $q.defer();
        //         elem.css({
        //           '-webkit-transition' : 'all .05s',
        //           'backgroundColor' : 'white'
        //         });
        //         $timeout(()=>{deferred.resolve();}, 50);
        //         return deferred.promise;
        //       });
        //     }
        //   };
          $rootScope.$emit(gameEvents.playerRegistered, scope);
      }
    };
  }])
}
