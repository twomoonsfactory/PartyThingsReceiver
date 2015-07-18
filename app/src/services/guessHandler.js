module.exports = function(eventService, guess, gameEvents, responseHandler){
  var self = this;
  this.guesses = [];
  this.newGuess = function(args){
    self.guesses.push(new guess(args.guesser,args.playerId,args.responseId));
  }
  this.tallyGuesses = function(){
    _.each(self.guesses, function(guess){
      if(guess.isWriter(responseHandler.getWriter(guess.responseId))){
        responseHandler.goodGuess({responseId:guess.responseId,guesser:guess.guesser});
      }
      else{
        responseHandler.badGuess({responseId:guess.responseId,guesser:guess.guesser,guessedWriter:guess.writer});
      }
    });
    responseHandler.resolveResponses();
  }
  this.wipeGuesses = function(){
    self.guesses = [];
  }
  eventService.subscribe(gameEvents.guessesSorted, this.wipeGuesses);
};
