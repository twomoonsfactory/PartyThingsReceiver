export default ngModule =>{
  class gameDriver{
    constructor(eventService, gameEvents, stateManager, gameStates, messageSender, messageProvider, messageNames, playerHandler, playerStates, responseHandler, promptProvider, guessHandler, gameNumbers){
      this.eventService = eventService;
      this.gameEvents = gameEvents;
      this.stateManager = stateManager;
      this.gameStates = gameStates;
      this.messageSender = messageSender;
      this.messageProvider = messageProvider;
      this.messageNames = messageNames;
      this.playerHandler = playerHandler;
      this.playerStates = playerStates;
      this.responseHandler = responseHandler;
      this.promptProvider = promptProvider;
      this.guessHandler = guessHandler;
      this.gameNumbers = gameNumbers;

      this.subscribeToGameEvents();
    }

    subscribeToGameEvents(){
      this.eventService.subscribe(this.gameStates.WaitingForReady, this.readyUp.bind(this));
      this.eventService.subscribe(this.gameEvents.readyReceived, this.playerReady.bind(this));
      this.eventService.subscribe(this.gameStates.ReadyToStart, this.sendPrompts.bind(this));
      this.eventService.subscribe(this.gameEvents.voteReceived, this.voteReceived.bind(this));
      this.eventService.subscribe(this.gameStates.PromptChosen, this.requestResponse.bind(this));
      this.eventService.subscribe(this.gameEvents.responseReceived, this.receivedResponse.bind(this));
      this.eventService.subscribe(this.gameStates.ResponsesReceived, this.startGuessing.bind(this));
      this.eventService.subscribe(this.gameEvents.guessReceived, this.guessReceiver.bind(this));
      this.eventService.subscribe(this.gameEvents.guessesResolved, this.guessesResolved.bind(this));
      this.eventService.subscribe(this.gameStates.RoundEnd, this.nextRound.bind(this));
      this.eventService.subscribe(this.gameStates.GameEnd, this.endGame.bind(this));
      this.eventService.subscribe(this.gameEvents.playerReconnected, this.playerReconnected.bind(this));
    }
        //takes over after the minimum number of players have joined and named themselves, requests them to indicate readiness
        //will skip players already sent this message as necessary (players carried over from previous games, etc)
    readyUp(){
      _.each(this.playerHandler.players, player => {
        if(player.state!==this.playerStates.quit&&player.state!==this.playerStates.readyRequested&&player.state!==this.playerStates.incoming){
          this.messageSender.requestReady({senderId: player.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.readyRequest, pname: player.playerName})});
          player.setState(this.playerStates.readyRequested);
          this.eventService.publish(this.gameEvents.playerActed+player.playerId, "");
        }
      });
      this.playerHandler.resetPlayerActedCount();
    }

    //confirms player ready when received, continues on with the game when all active players have "readied"
    playerReady(args){
      let readyPlayer = this.playerHandler.findPlayerBySenderId(args.senderId);
      if(!readyPlayer.checkState(this.playerStates.ready)){
        readyPlayer.setState(this.playerStates.ready);
        this.eventService.publish(this.gameEvents.playerActed+readyPlayer.playerId, "");
        this.playerHandler.playerActed();
        this.eventService.publish(this.gameEvents.updatePlayers, "");
        if(this.playerHandler.actedPlayersCount >= this.playerHandler.activePlayers && this.playerHandler.actedPlayersCount >= this.gameNumbers.minimumPlayers){
           //sets statecount back to 0
          this.playerHandler.resetPlayerActedCount();
          this.stateManager.setState(this.gameStates.ReadyToStart);
        }
      }
    }

    //sends each player the same three prompts to vote on
    sendPrompts(){
      _.each(this.playerHandler.players, player => {
        if(player.checkState(this.playerStates.ready)){
          this.messageSender.requestPrompt({senderId: player.senderId, message: {message: this.messageProvider.getMessage({messageName: this.messageNames.promptRequest, pname: player.playerName}), prompts: this.promptProvider.currentprompts}});
          player.setState(this.playerStates.voting);
          this.eventService.publish(this.gameEvents.playerActed+player.playerId, "");
        }
      });
    }

    //manages incoming votes, assigning them to the right prompt, then calling the prompt provider to return the winning prompt when
    //all votes are received.
    voteReceived(args){
      let votingPlayer = this.playerHandler.findPlayerBySenderId(args.senderId);
      if(votingPlayer.checkState(this.playerStates.voting)){
        votingPlayer.setState(this.playerStates.ready);
        this.eventService.publish(this.gameEvents.playerActed+votingPlayer.playerId, "");
        this.promptProvider.promptVote(args.message.prompt);
        this.playerHandler.playerActed();
        if(this.playerHandler.actedPlayersCount===this.playerHandler.activePlayers){
          this.promptProvider.tallyVotes();
          this.playerHandler.resetPlayerActedCount();
          this.stateManager.setState(this.gameStates.PromptChosen);
        }
      }
    }

    //sends winning prompt to users for their responses
    requestResponse(){
      _.each(this.playerHandler.players, player => {
        if(player.checkState(this.playerStates.ready)){
          this.messageSender.requestResponse({senderId:player.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.responseRequest, prompt: this.promptProvider.prompt})});
          player.setState(this.playerStates.writing);
          this.eventService.publish(this.gameEvents.playerActed+player.playerId, "");
        }
      });
    }

    //manages incoming things, sending the new thing to the this.responseHandler, until all players have submitted their "things"
    receivedResponse(args){
      let responseWriter = this.playerHandler.findPlayerBySenderId(args.senderId);
      if(responseWriter.checkState(this.playerStates.writing)){
        this.responseHandler.newResponse({response: args.message.thing, playerId:responseWriter.playerId});
        responseWriter.setState(this.playerStates.ready);
        responseWriter.written = true;
        this.eventService.publish(this.gameEvents.playerActed+responseWriter.playerId, "");
        this.playerHandler.playerActed();
        if(this.playerHandler.actedPlayersCount===this.playerHandler.activePlayers){
          this.playerHandler.resetPlayerActedCount();
          this.stateManager.setState(this.gameStates.ResponsesReceived);
        }
      }
    }

    //starts the guessing round, sending each active player a list of elegible things and another of elegible players
    startGuessing(){
      _.each(this.playerHandler.players, player => {
        if(player.checkState(this.playerStates.ready)){
          this.messageSender.requestGuess({senderId: player.senderId,message:{
            message: this.messageProvider.getMessage({messageName:this.messageNames.guessRequest}),
            things: _.filter(this.responseHandler.getResponses(), response => {return this.responseHandler.getWriter(response.responseId)!==player.playerId}),
            // things: this.responseHandler.getResponses(),
            elegiblePlayers: _.filter(this.responseHandler.getAuthors(), author => {return author.playerId !== player.playerId})
            // elegiblePlayers: this.responseHandler.getAuthors()
          }});
          player.setState(this.playerStates.guessing);
          this.eventService.publish(this.gameEvents.playerActed+player.playerId, "");
        }
      });
    }

    //handles guesses -- iterates through rounds of guessing until there are no unguessed players or only one unguessed player.
    guessReceiver(args){
      let guesser = this.playerHandler.findPlayerBySenderId(args.senderId)
      if(guesser.checkState(this.playerStates.guessing)){
        this.guessHandler.newGuess({guesser: guesser.playerId, playerId: args.message.playerId, responseId: args.message.responseId});
        guesser.setState(this.playerStates.ready);
        this.eventService.publish(this.gameEvents.playerActed+guesser.playerId, "");
        // this.messageSender.requestGuess({senderId: guesser.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.guessConfirm, pname: this.playerHandler.players[args.message.playerId].playerName, resp: this.responseHandler.responses[args.message.responseId].response})});
        this.playerHandler.actedPlayersCount++;
        if(this.playerHandler.actedPlayersCount===this.playerHandler.activePlayers){
          this.playerHandler.actedPlayersCount = 0;
          this.guessHandler.tallyGuesses();
        }
      }
    }

    //either moves game forward to round resolution or back to guessing if still more than one unguessed player
    guessesResolved(args){
      if(this.playerHandler.unguessedPlayers())
        this.stateManager.resetState(this.gameStates.ResponsesReceived);
      else
        this.stateManager.setState(this.gameStates.GuessesDisplayed);
    }

    //function to either roll things back to a fresh round with all the active players and players standing by, or
    //sends the game on to end game.
    nextRound(){
      if(this.playerHandler.highScore()>=this.playerHandler.winningScore){
        let winners = this.playerHandler.getWinners();
        let score = this.playerHandler.highScore();
        this.eventService.publish(this.gameEvents.winnersDecided, {winners: winners, score: score});
        this.stateManager.setState(this.gameStates.GameEnd);
        this.playerHandler.freshGame();
      }
      else{
        _.each(this.playerHandler.players, player => {
          if(player.checkState(this.playerStates.standingBy)){
            this.messageSender.requestReady({senderId: player.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.standingByReadyRequest, pname: player.playerName})});
            player.setState(this.playerStates.ready);
            this.eventService.publish(this.gameEvents.playerActed+player.playerId, "");
            this.playerHandler.activePlayers++;
          }
        });
        this.playerHandler.freshRound();
        this.stateManager.setState(this.gameStates.ReadyToStart);
      }
    }

    //handles the final end game, displaying the winner(s), and asking players if they want to play again
    endGame(){
      //Logic to display winners.
      _.each(this.playerHandler.players, player => {
        let endMessage = "";
        if(player.checkState(this.playerStates.ready)||player.checkState(this.playerStates.standingBy)){
          if(_.contains(this.stateManager.winners, player)){
            endMessage += this.messageProvider.getMessage({messageName: this.messageNames.winner, pname: player.playerName, points: this.playerHandler.highScore()});
          }
          endMessage+= this.messageProvider.getMessage({messageName: this.messageNames.endGame});
          this.messageSender.sendEnd({senderId: player.senderId, message: endMessage});
          if(player.checkState(this.playerStates.standingBy))this.playerHandler.activePlayers++;
          player.setState(this.playerStates.readyRequested);
          this.eventService.publish(this.gameEvents.playerActed+player.playerId, "");
        }
      });
      this.eventService.publish(this.gameEvents.endView, "");
    }

    playerReconnected(player){
      switch(player.state){
        case this.playerStates.standingBy:
          this.messageSender.sendStandby({senderId: player.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.standby, pname: player.playerName})});
        break;
        case this.playerStates.readyRequested:
          this.messageSender.requestReady({senderId: player.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.readyRequest, pname: player.playerName})});
        break;
        case this.playerStates.voting:
          this.messageSender.requestPrompt({senderId: player.senderId, message: {message: this.messageProvider.getMessage({messageName: this.messageNames.promptRequest, pname: player.playerName}), prompts: this.promptProvider.currentprompts}});
        break;
        case this.playerStates.writing:
          this.messageSender.requestResponse({senderId:player.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.responseRequest, prompt: this.promptProvider.prompt})});
        break;
        case this.playerStates.guessing:
          this.messageSender.requestGuess({senderId: player.senderId,message:{
            message: this.messageProvider.getMessage({messageName:this.messageNames.guessRequest}),
            things: _.filter(this.responseHandler.getResponses(), response => {return this.responseHandler.getWriter(response.responseId)!==player.playerId}),
            elegiblePlayers: _.filter(this.responseHandler.getAuthors(), author => {return author.playerId !== player.playerId})
            // things: this.responseHandler.getResponses(),
            // elegiblePlayers: this.responseHandler.getAuthors()
          }});
        break;
        default:
          this.messageSender.sendWait({senderId: player.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.wait})});
        break;
      }
    }
  }
  gameDriver.$inject = ['eventService', 'gameEvents', 'stateManager', 'gameStates', 'messageSender', 'messageProvider', 'messageNames', 'playerHandler', 'playerStates', 'responseHandler', 'promptProvider', 'guessHandler', 'gameNumbers'];
  ngModule.service('gameDriver', gameDriver);
}
