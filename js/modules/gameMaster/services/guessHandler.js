angular.module('gameMaster')
//hadles the guesses
    .service('guessHandler', ['$log', 'eventService', ' gameStates', 'responseHandler', function($log, eventService, gameStates, responseHandler){
      var self = this;
      this.guesses = [];
      this.newGuess = function(args){
        self.guesses.push(new guess(args.guesser,args.data.playerId,args.data.responseId));
      }
      this.tallyGuesses = function(){
        _.each(self.guesses, function(guess){
          if(guess.isWriter(responseHandler.getWriter(guess.responseId))){
            responseHandler.goodGuess({responseId:guess.responseId,guesser:guess.guesser});
          }
          else{
            responseHandler.badGuess({responseId:guess.responseId,guesser:guess.guesser,writer:guess.playerId});
          }
        });
        responseHandler.resolveresponses();
      }
      this.wipeGuesses = function(){
        self.guesses = [];
      }
      eventService.subscribe(gameStates.RoundEnd, this.wipeGuesses);
    }]);