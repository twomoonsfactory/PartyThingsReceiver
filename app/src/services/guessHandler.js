export default ngModule => {
  class guessHandler{
    constructor(eventService, guessFactory, gameEvents, responseHandler, $log, playerHandler){
      this.eventService = eventService;
      this.guessFactory = guessFactory;
      this.gameEvents = gameEvents;
      this.responseHandler = responseHandler;
      this.playerHandler = playerHandler;
      this.$log = $log;

      this.guesses = [];

      this.subscribeToGameEvents();
    }
    //subscribes callbacks for events
    subscribeToGameEvents(){
      this.eventService.subscribe(this.gameEvents.guessesSorted, this.wipeGuesses.bind(this));
    }
    //adds a new guess
    newGuess(args){
      this.guesses.push(this.guessFactory.newGuess(args.guesser,args.playerId,args.responseId/1));
      this.$log.log(this.playerHandler.findPlayerByPlayerId(args.guesser).playerName + ' guessed that '
                    + this.playerHandler.findPlayerByPlayerId(args.playerId).playerName + ' said "'
                    + _.findWhere(this.responseHandler.responses, {responseId: args.responseId/1}).response + '"');
    }
    //sorts existing guesses
    tallyGuesses(){
      this.responseHandler.wipeGuesses();
      _.each(this.guesses, guess => {
        if(guess.isWriter(this.responseHandler.getWriter(guess.responseId))){
          this.responseHandler.goodGuess({responseId:guess.responseId,guesser:guess.guesser});
        }
        else{
          this.responseHandler.badGuess({responseId:guess.responseId,guesser:guess.guesser,guessedWriter:guess.writer});
        }
      });
      this.responseHandler.resolveResponses();
    }
    //wipes guess array
    wipeGuesses(){
      this.guesses = [];
    }
  }
  guessHandler.$inject = ['eventService', 'guessFactory', 'gameEvents', 'responseHandler', '$log', 'playerHandler'];
  ngModule.service('guessHandler', guessHandler);
}
