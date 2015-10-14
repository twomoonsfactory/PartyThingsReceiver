export default ngModule => {
  ngModule.directive('responseGuessDisplay', ['$rootScope', '$q', '$timeout', 'gameEvents', ($rootScope, $q, $timeout, gameEvents)=>{
    return{
      restrict: 'A',
      scope:{
        response: "=responseGuessDisplay"
      },
      link: (scope, elem, attrs)=>{
        let trueColor;
        let falseColor;
        let unguessedColor;
        let colorTime = 1000;
          scope.checkIfGuessed = (guess)=>{
            if(guess.responseId===scope.response.responseId){
              //if it is the response being processed, will animate based on whether it was guessed
              //correctly, incorrectly, or not at all.
              if(guess.guesses>0)
                if(guess.correct.length>0)
                  scope.animateGuess(1);
                else
                  scope.animateGuess(-1);
              else
                scope.animateGuess(0);
            }
          };
          scope.animateGuess = (num)=>{
            //general animation if guessed
            $q.when()
            .then(()=>{
              let deferred = $q.defer();
              elem.addClass('guess1');
              $timeout(()=>{deferred.resolve();}, colorTime);
              return deferred.promise;
            })
            .then(()=>{
              let deferred = $q.defer();
              elem.removeClass('guess1').addClass('guess2');
              $timeout(()=>{deferred.resolve();}, colorTime);
              return deferred.promise;
            })
            .then(()=>{
              let deferred = $q.defer();
              elem.removeClass('guess2')
              $timeout(()=>{deferred.resolve();}, colorTime);
              return deferred.promise;
            })
            if(num===1){
              //animate for true guess
              $q.when()
              .then(()=>{
                let deferred = $q.defer();
                elem.addClass('guessRight')
                $timeout(()=>{deferred.resolve();}, colorTime);
                return deferred.promise;
              })
              .then(()=>{
                let deferred = $q.defer();
                //supressed class
                elem.addClass('supressed');
                $timeout(()=>{deferred.resolve();}, colorTime);
                return deferred.promise;
              })
              .then(()=>{
                let deferred = $q.defer();
                elem.removeClass('guessRight');
                $timeout(()=>{deferred.resolve();}, colorTime);
                return deferred.promise;
              });
            }
            else if(num===-1){
              //animate for false guess
              $q.when()
              .then(()=>{
                let deferred = $q.defer();
                elem.addClass('guessWrong');
                $timeout(()=>{deferred.resolve();}, colorTime);
                return deferred.promise;
              })
              .then(()=>{
                let deferred = $q.defer();
                elem.removeClass('guessWrong');
                $timeout(()=>{deferred.resolve();}, colorTime);
                return deferred.promise;
              });
            }
            else {
              //animate for unguessed
              $q.when()
              .then(()=>{
                let deferred = $q.defer();
                elem.addClass('unguessed');
                $timeout(()=>{deferred.resolve();}, colorTime);
                return deferred.promise;
              })
              .then(()=>{
                let deferred = $q.defer();
                elem.removeClass('unguessed');
                $timeout(()=>{deferred.resolve();}, colorTime);
                return deferred.promise;
              });
            }
          };
          $rootScope.$emit(gameEvents.responseRegistered, scope);
      }
    };
  }])
}
