export default ngModule => {
  class guessHandler{
    constructor(eventService, guessFactory, gameEvents, responseHandler){
      this.eventService = eventService;
      this.guessFactory = guessFactory;
      this.gameEvents = gameEvents;
      this.responseHandler = responseHandler;

      this.guesses = [];

      this.subscribeToGameEvents();
    }
    //subscribes callbacks for events
    subscribeToGameEvents(){
      this.eventService.subscribe(this.gameEvents.guessesSorted, this.wipeGuesses.bind(this));
    }
    //adds a new guess
    newGuess(args){
      this.guesses.push(guessFactory.newGuess(args.guesser,args.playerId,args.responseId));
    }
    //sorts existing guesses
    tallyGuesses(){
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
  guessHandler.$inject = ['eventService', 'guessFactory', 'gameEvents', 'responseHandler'];
  ngModule.service('guessHandler', guessHandler);
}
