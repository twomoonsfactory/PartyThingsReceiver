export default ngModule => {
  ngModule.service('guessHandler', ['eventService', 'guess', 'gameEvents', 'responseHandler', (eventService, guess, gameEvents, responseHandler) => {
    let self = this;
    this.guesses = [];
    this.newGuess = args => {
      self.guesses.push(new guess(args.guesser,args.playerId,args.responseId));
    }
    this.tallyGuesses = ()=>{
      _.each(self.guesses, guess => {
        if(guess.isWriter(responseHandler.getWriter(guess.responseId))){
          responseHandler.goodGuess({responseId:guess.responseId,guesser:guess.guesser});
        }
        else{
          responseHandler.badGuess({responseId:guess.responseId,guesser:guess.guesser,guessedWriter:guess.writer});
        }
      });
      responseHandler.resolveResponses();
    }
    this.wipeGuesses = ()=>{
      self.guesses = [];
    }
    eventService.subscribe(gameEvents.guessesSorted, this.wipeGuesses);
  }])
}
