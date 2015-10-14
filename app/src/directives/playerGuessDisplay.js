export default ngModule => {
  ngModule.directive('playerGuessDisplay', ['$rootScope', '$q', '$timeout', 'gameEvents', ($rootScope, $q, $timeout, gameEvents)=>{
    return{
      restrict: 'A',
      scope:{
        player: "=playerGuessDisplay"
      },
      link: (scope, elem, attrs)=>{

        scope.checkIfGuessed = (guess)=>{

        }

        scope.checkIfScored = (guess)=>{
          
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
