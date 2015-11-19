export default ngModule => {
  class playerHandler{
    constructor(gameNumbers, eventService, playerFactory, messageSender, stateManager, gameEvents, gameStates, playerStates, messageNames, messageProvider, $log){
      this.eventService = eventService;
      this.playerFactory = playerFactory;
      this.messageSender = messageSender;
      this.stateManager = stateManager;
      this.gameEvents = gameEvents;
      this.gameStates = gameStates;
      this.playerStates = playerStates;
      this.messageNames = messageNames;
      this.messageProvider = messageProvider;
      this.$log = $log;
      this.winningScore = gameNumbers.winningScore; //the score that, when reached, ends the game

      //local variables
      this.players = [];          //contains all players of the game
      this.playerCounter = 0;     //keeps players assigned sequentially
      this.actedPlayersCount = 0;        //how many players have participated in the current state
      this.activePlayers = 0;     //the number of players currently playing -- should it be moved to the playerHandler?
      this.minimumPlayers = gameNumbers.minimumPlayers;    //the minimum number of players to start the game
      this.joinedPlayers = 0;     //the number of players joined, named or not.  Used for "incoming player"
      this.numberOfActedPlayersQuitting = 0;    //counts the players who have quit during a given phase after acting

      this.subscribeToGameEvents();
    }

    subscribeToGameEvents(){
      this.eventService.subscribe(this.gameEvents.playerJoined, this.addPlayer.bind(this));
      this.eventService.subscribe(this.gameEvents.gamenameReceived, this.gameNamed.bind(this));
      this.eventService.subscribe(this.gameEvents.playernameReceived, this.playerNamed.bind(this));
      this.eventService.subscribe(this.gameEvents.quitReceived, this.playerQuit.bind(this));
      this.eventService.subscribe(this.gameEvents.newGameRequested, this.dropQuitPlayers.bind(this));
      this.eventService.subscribe(this.gameStates.ReadyToStart, this.dropQuitPlayers.bind(this));
      this.eventService.subscribe(this.gameEvents.playerUpdated, this.playerUpdated.bind(this));
      this.eventService.subscribe(this.gameEvents.welcomeLoaded, this.playerUpdated.bind(this));
      this.eventService.subscribe(this.gameStates.RoundEnd, this.freshRound.bind(this));
    }

    addPlayer(args){
      if(this.stateManager.checkState(null)){
        this.messageSender.requestGameName({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.nameGame})});
      }
      else{
        this.messageSender.requestPlayerName({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.namePlayer, gname: this.stateManager.gameName})});
      }
      this.players.push(this.playerFactory.newPlayer(args.senderId, this.playerCounter));
      this.playerCounter++;
      this.eventService.publish(this.gameEvents.playerUpdated, "");
    }


    //this is where the game is named and the first player is created
    gameNamed(args){
      this.stateManager.gameName = args.message.gameName;
      this.eventService.publish(this.gameEvents.gameNamed, {gameName: args.message.gameName, ownerName: args.message.playerName});
      this.playerNamed(args);
    }

    //this is where new players are created and assigned a state appropriate to the game's state, ready requests even being handled.
    //Need error handling for duplicate player names, as it can create confusion
    playerNamed(args){
      let namedPlayer = this.findPlayerBySenderId(args.senderId);
      namedPlayer.namePlayer(args.message.playerName);
      if(this.stateManager.checkState(this.gameStates.WaitingForStart)){
        namedPlayer.setState(this.playerStates.waiting);
        this.activePlayers++;
      }
      else if(this.stateManager.checkState(this.gameStates.WaitingForReady)){
        this.messageSender.requestReady({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.readyRequest, pname: args.message.playerName})});
        namedPlayer.setState(this.playerStates.readyRequested);
        this.activePlayers++;
      }
      else{
        this.messageSender.sendStandby({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.standby, pname: args.message.playerName, gname: this.stateManager.gameName})});
        namedPlayer.setState(this.playerStates.standingBy);
      }
      this.eventService.publish(this.gameEvents.playerUpdated, "");
      if(this.activePlayers>=this.minimumPlayers && this.stateManager.checkState(this.gameStates.WaitingForStart)){
        this.stateManager.setState(this.gameStates.WaitingForReady);
      }
    }

    //returns unguessed, still playing players
    getGuessablePlayers(){
      let elegiblePlayers = [];
      _.each(this.players, player => {
        if(player.checkState(this.playerStates.ready) && !player.guessed)
          elegiblePlayers.push({playerName: player.playerName, playerId: player.playerId});
      });
      return elegiblePlayers;
    }

    //gives players their points, determined in the response handler
    assignPoints(args){
      _.findWhere(this.players, {playerId: args.playerId}).addScore(args.points);
      this.eventService.publish(this.gameEvents.playerUpdated, "");
    }

    //establishes that the given player has been guessed
    playerGuessed(args){
      _.findWhere(this.players, {playerId: args.playerId}).wasGuessed();
      this.eventService.publish(this.gameEvents.playerUpdated, "");
    }

    //returns true if there are more than 1 unguessed players
    unguessedPlayers(){
      let results = _.countBy(this.players, player => {
        if((player.guessed === true)||(!player.checkState(this.playerStates.ready)))
          return 'guessed';
        else
          return 'unguessed';
      })
      return results.unguessed > 1 ? true : false;
    }

    //returns the highest score
    highScore(){
      let high = 0;
      _.each(this.players, player => {
        high = player.score > high ? player.score : high;
      });
      return high;
    }

    //returns the player names of the winning player(s)
    getWinners(){
      let winners = [];
      if(this.highScore()>=this.winningScore){
        _.each(this.players, player => {
          if(player.score===this.highScore())
            winners.push(player.playerName);
        });
      }
      return winners;
    }

    //emits winners if any
    winnersChosen(){
      if(this.getWinners().length>0)
        return this.getWinners();
      else
        return false;
    }

    //at the end of round, sets all players to unguessed
    freshRound(){
      _.each(this.players, player => {
        player.freshRound();
      });
      this.eventService.publish(this.gameEvents.playersUpdated, this.players);
    }

    //at the end of game, sets all scores to zero, all players to unguessed
    freshGame(){
      _.each(this.players, player => {
          player.freshGame();
        });
      this.eventService.publish(this.gameEvents.playersUpdated, this.players);
    }

    //allows the players to quit at any point without seriously disrupting gameplay.  Will still allow for submitted things to be guessed
    //for points, etc.
    playerQuit(args){
      let quitter = this.findPlayerBySenderId(args.senderId);
      if(quitter.checkState(this.playerStates.ready))
        this.numberOfActedPlayersQuitting++;  //removes players from count of players who have participated in a step
      else if(!quitter.checkState(this.playerStates.standingBy)&&!quitter.checkState(this.playerStates.incoming))
        this.activePlayers--;  //removes players from count of players currently playing
      //logic to remove quit player from on screen display here
      quitter.setState(this.playerStates.quit);
      this.messageSender.sendQuit({senderId: quitter.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.quit, pname: quitter.playerName})});
      this.eventService.publish(this.gameEvents.playerUpdated, "");
      if(this.stateManager.checkState(this.gameStates.WaitingForStart)||this.stateManager.checkState(this.gameStates.GameEnd))
        this.dropQuitPlayers();
    }

    //removes players who had quit after acting from the count of
    removeActedPlayers(){
      this.activePlayers = this.activePlayers - this.numberOfActedPlayersQuitting;
      this.numberOfActedPlayersQuitting = 0;
    }

    //actually drops the quit players altogether
    dropQuitPlayers(){
      let toDrop = [];
      _.each(this.players, player => {
        if(player.checkState(this.playerStates.quit))
          toDrop.push(player);
      });
      this.players = _.difference(this.players, toDrop);
      this.eventService.publish(this.gameEvents.playersUpdated, this.players);
    }


    playerActed(){
      this.actedPlayersCount++;
    }

    resetPlayerActedCount(){
      this.actedPlayersCount = 0;
      this.removeActedPlayers();
    }

    findPlayerByPlayerId(args){
      let foundPlayer = _.find(this.players, player => player.playerId===args);
      return foundPlayer;
    }

    findPlayerBySenderId(args){
      let foundPlayer = _.find(this.players, player => player.senderId===args);
      return foundPlayer;
    }

    playerUpdated(){
      if(this.joinedPlayers > this.playerCounter){ //meaning there are still player(s) joining who aren't yet named
        if(_.last(this.players)!==this.incoming){
          this.players[this.playerCounter] = this.incoming;
        }
      }
      else if(this.incoming===(_.last(this.players))){ //otherwise it drops the "incoming" player if present
        this.players.splice(this.players.length-1, 1);
      }
      this.eventService.publish(this.gameEvents.playersUpdated, this.players);
    }
  }
  playerHandler.$inject = ['gameNumbers', 'eventService', 'playerFactory', 'messageSender', 'stateManager', 'gameEvents', 'gameStates', 'playerStates', 'messageNames', 'messageProvider', '$log'];
  ngModule.service('playerHandler', playerHandler);
}
