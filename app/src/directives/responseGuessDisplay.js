export default ngModule => {
  ngModule.directive('responseGuessDisplay', ['$rootScope', '$q', '$timeout', 'gameEvents', 'gameNumbers', ($rootScope, $q, $timeout, gameEvents, gameNumbers)=>{
    return{
      restrict: 'A',
      scope:{
        response: "=responseGuessDisplay"
      },
      link: (scope, elem, attrs)=>{
        scope.responseSlip = null;
        scope.wasGuessed = false;
        scope.checkIfGuessed = (guess)=>{
          if(guess.responseId===scope.response.responseId){
            //if it is the response being processed, will animate based on whether it was guessed
            //correctly, incorrectly, or not at all.
            if(guess.guesses>0){
              if(guess.correct.length>0){
                scope.animateGuess(1);
                scope.wasGuessed = true;
                //returns true if the guess was correct
                return true;
              }
              else
                scope.animateGuess(-1);
            }
            else
              scope.animateGuess(0);
            return false;
          }
        };

        scope.checkIfUnguessed = (guess) =>{
          if(guess.responseId===scope.response.responseId){
            scope.animateGuess(0);
            return true;
          }
          return false;
        }

        scope.animateGuess = (num)=>{
          //general animation if guessed
          //classes are guess1 - first state of pulse
          //            guess2 - second state of pulse
          //            guessMid = midpoint of pulse
          //    each has a .75s transition time
          //            guessRight - color for correctly guessed
          //            guessWrong - color for incorrectly guessed
          //            unguessed - color for unguessed
          //            supressed - class to drop card flat
          //            unguessedResponse - class to remove from guessed response
          //            beingGuessed - class to add for duration of guess
          $q.when()
          .then(()=>{
            let defer = $q.defer();
            elem.removeClass('unguessedResponse cardHue').addClass('beingGuessed guessMid');
            $timeout(()=>{defer.resolve()}, gameNumbers.guessDisplayTime);
            return defer.promise;
          })
          .then(()=>{
            elem.removeClass('guessMid').addClass(num>0?'guessRight':num<0?'guessWrong':'unguessed');
          });
        };

        //returns the response slip to the proper state
        scope.resolveAnimation=()=>{
          elem.removeClass('beingGuessed guessRight guessWrong unguessed').addClass('unguessedResponse cardHue');
          if(scope.wasGuessed)scope.responseSlip.mark();
          scope.wasGuessed = false;
          $timeout(()=>{
            scope.$apply();
          });
        }

        $rootScope.$emit(gameEvents.responseRegistered, scope);
      }
    };
  }])
}
