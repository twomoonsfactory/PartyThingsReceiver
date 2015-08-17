export default class guessHandler{
  constructor(eventService, guess, gameEvents, responseHandler){
    this.guesses = [];

    //local references for injected externals
    this.eventService = eventService;
    this.guess = guess;
    this.gameEvents = gameEvents;
    this.responseHandler = responseHandler;

    //event subscriptions
    this.eventService.subscribe(this.gameEvents.guessesSorted, this.wipeGuesses);    
  }
  //adds a guess to the list
  newGuess(args){
    this.guesses.push(new guess(args.guesser,args.playerId,args.responseId));
  }
  //sorts guesses
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
  //refreshes the guess list
  wipeGuesses(){
    this.guesses = [];
  }
}
guessHandler.$inject = ['eventService', 'guess', 'gameEvents', 'responseHandler'];
