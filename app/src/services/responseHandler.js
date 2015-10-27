export default ngModule => {
  class responseHandler{
    constructor(eventService, responseFactory, gameEvents, gameStates, playerHandler, responseProvider, $log){
      this.eventService = eventService;
      this.responseFactory = responseFactory;
      this.gameEvents = gameEvents;
      this.gameStates = gameStates;
      this.playerHandler = playerHandler;
      this.responseProvider = responseProvider;
      this.$log = $log;

      this.responses = [];
      this.responseList = []; //list sent to users
      this.responseCounter = 1;
      this.shuffled = false;

      this.subscribeToGameEvents();
    }

    subscribeToGameEvents(){
      this.eventService.subscribe(this.gameStates.RoundEnd, this.freshResponses.bind(this));
      this.eventService.subscribe(this.gameStates.PromptChosen, this.freshResponses.bind(this));
    }

    newResponse(args){
      this.responses[this.responseCounter] = this.responseFactory.newResponse(args.response, this.responseCounter, args.playerId);
      this.responseCounter++;
    }

    wipeGuesses(){
      _.each(this.responses, response => {
        response.wipeGuesses();
      });
      this.shuffled = false;
    }

    //returns list of responses to displays
    getResponsesForDisplay(){
      return this.responses;
    }

    //returns list of responses to send to players
    getResponses(){
      if(!this.shuffled){
        this.responseList = [];
        _.each(this.responses, currentresponse => {
          if(!currentresponse.guessed) this.responseList.push({response: currentresponse.response, responseId: currentresponse.responseId});
        });
        this.responseList = _.shuffle(this.responseList);
        this.shuffled = true;
      }
      return this.responseList;
    }

    //getter for playerId of the writer of a particular response
    getWriter(args){
      return _.findWhere(this.responses, {responseId: args}).playerId;
    }

    //adds correct guess
    goodGuess(args){
      let response = _.findWhere(this.responses, {responseId: args.responseId});
      response.addGoodGuess(args.guesser,_.findWhere(this.playerHandler.players, {playerId: response.playerId}).playerId);
    }

    //adds incorrect guess
    badGuess(args){
      _.findWhere(this.responses, {responseId: args.responseId}).addWrongGuess(args.guesser,args.guessedWriter);
    }

    //resolves correct and incorrect guessers, called by resolveGuesses
    resolveResponses(){
      this.eventService.publish(this.gameEvents.guessesSorted ,this.responses);
      // let correctlyGuessedResponses = [];
      // let incorrectlyGuessedResponses = [];
      // let toRemove = [];
      // _.each(this.responses, response => {
      //   if(response.incorrect.length>0){
      //     //adds to incorrect guess array
      //     incorrectlyGuessedResponses.push(response);
      //   }
      //
      //   //assigns points
      //   if(response.correct.length>0){
      //     //adds to correct guess array
      //     correctlyGuessedResponses.push(response);
      //     toRemove.push(_.where(this.responses, {responseId: response.responseId})[0]);
      //   }
      // });
      // this.sortResponses({right: correctlyGuessedResponses, wrong: incorrectlyGuessedResponses});
      // //remove guessedresponses from the array
      // this.responses = _.difference(this.responses, toRemove);
      // _.each(this.responses, response => {
      //   response.wipeGuesses();
      // });
    }

    //gathers in the guessed responses by whether they were guessed correctly or not and gathers all information needed for display and scoring before publishing them
    sortResponses(args){
      let right = args.right;
      let wrong = args.wrong;
      let correct = [];
      let incorrect = [];
      _.each(right, goodGuess => {
        correct.push({response: goodGuess.response, writer: this.playerHandler.players[goodGuess.playerId].playerName, writerId:goodGuess.playerId, guessers: []});
        _.each(goodGuess.correct, rightGuesser => {
          _.last(correct).guessers.push({guesser: this.playerHandler.players[rightGuesser.guesser].playerName, guesserId: rightGuesser});
        });
      });
      _.each(wrong, badGuess => {
        incorrect.push({response: badGuess.response, guessers: []});
        _.each(badGuess.incorrect, wrongGuess => {
          _.last(incorrect).guessers.push({guesser: this.playerHandler.players[wrongGuess.guesser].playerName, guesserId: wrongGuess.guesser, guessedWriter: this.playerHandler.players[wrongGuess.guessedWriter].playerName, guessedWriterId: wrongGuess.guessedWriter});
        });
      });
      _.each(this.responses, response => {
        response.wipeGuesses();
      });
      this.shuffled = false;
      this.eventService.publish(this.gameEvents.guessesSorted, {guessedRight: correct, guessedWrong: incorrect});
    }

    //starts fresh at the beginning of the game, or at the start of a new round
    freshResponses(){
      this.responses = [];
      this.responseCounter = 0;
      this.newResponse({response: this.responseProvider.getRandomResponse(), playerId: -1});
      this.shuffled = false;
    }
  }
  responseHandler.$inject = ['eventService', 'responseFactory', 'gameEvents', 'gameStates', 'playerHandler', 'responseProvider', '$log'];
  ngModule.service('responseHandler', responseHandler);
}
