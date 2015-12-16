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
      this.players = {};          //contains all players of the game
      this.actedPlayersCount = 0;        //how many players have participated in the current state
      this.activePlayers = 0;     //the number of players currently playing -- should it be moved to the playerHandler?
      this.minimumPlayers = gameNumbers.minimumPlayers;    //the minimum number of players to start the game
      this.joinedPlayers = 0;     //the number of players joined, named or not.  Used for "incoming player"
      this.numberOfActedPlayersQuitting = 0;    //counts the players who have quit during a given phase after acting
      this.gameWasNamed = false;

      this.subscribeToGameEvents();
    }

    subscribeToGameEvents(){
      this.eventService.subscribe(this.gameEvents.playerJoined, this.playerConnected.bind(this));
      this.eventService.subscribe(this.gameEvents.playerIdReceived, this.playerJoined.bind(this));
      this.eventService.subscribe(this.gameEvents.gamenameReceived, this.gameNamed.bind(this));
      this.eventService.subscribe(this.gameEvents.playernameReceived, this.playerNamed.bind(this));
      this.eventService.subscribe(this.gameEvents.quitReceived, this.playerQuit.bind(this));
      this.eventService.subscribe(this.gameEvents.newGameRequested, this.dropQuitPlayers.bind(this));
      this.eventService.subscribe(this.gameStates.ReadyToStart, this.dropQuitPlayers.bind(this));
      this.eventService.subscribe(this.gameEvents.updatePlayers, this.updatePlayers.bind(this));
      this.eventService.subscribe(this.gameEvents.welcomeLoaded, this.updatePlayers.bind(this));
      this.eventService.subscribe(this.gameStates.RoundEnd, this.freshRound.bind(this));
    }

    playerConnected(args){
      //when a player joins, prompts the sender app to respond with their unique ID
      this.messageSender.requestPlayerId({senderId: args.senderId, message: ''});
      this.$log.log('player connected');
      this.playersUpdated();
    }

    playerJoined(args){
      //checks to see if the player already exists
      if(args.message.playerId in this.players){
        let player = players[args.message.playerId];
        if(player.checkState(this.playerStates.incoming))
          this.addPlayer(player.senderId);
        else
          this.eventService.publish(this.gameEvents.playerReconnected, player);
      }
      else {
        this.players[args.message.playerId] = this.playerFactory.newPlayer(args.senderId, args.message.playerId);
        this.addPlayer(this.players[args.message.playerId].senderId);
      }
    }

    addPlayer(args){
      if(this.stateManager.checkState(this.gameStates.WaitingForFirstPlayer)){
        this.messageSender.requestGameName({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.nameGame})});
        this.stateManager.setState(this.gameStates.WaitingForStart);
      }
      else{
        this.messageSender.requestPlayerName({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.namePlayer, gname: this.stateManager.gameName})});
      }
      this.eventService.publish(this.gameEvents.updatePlayers, this.players);
    }


    //this is where the game is named and the first player is created
    gameNamed(args){
      if(this.stateManager.gameName!==args.message.gameName){
        this.stateManager.gameName = args.message.gameName;
        this.eventService.publish(this.gameEvents.gameNamed, {gameName: args.message.gameName, ownerName: args.message.playerName});
      }
      this.gameWasNamed = true;
      this.playerNamed(args);
    }

    //this is where new players are created and assigned a state appropriate to the game's state, ready requests even being handled.
    //Need error handling for duplicate player names, as it can create confusion
    playerNamed(args){
      let namedPlayer = this.findPlayerBySenderId(args.senderId);
      if(namedPlayer.playerName!==args.message.playerName||args.message.playerName==="Incoming..."){
        namedPlayer.namePlayer(args.message.playerName);
        if(this.stateManager.checkState(this.gameStates.WaitingForStart)){
          namedPlayer.setState(this.playerStates.standingBy);
          this.activePlayers++;
        }
        else if(this.stateManager.checkState(this.gameStates.WaitingForReady)||this.stateManager.checkState(this.gameStates.GameEnd)){
          this.messageSender.requestReady({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.readyRequest, pname: args.message.playerName})});
          namedPlayer.setState(this.playerStates.readyRequested);
          this.activePlayers++;
        }
        else{
          this.messageSender.sendStandby({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.standby, pname: args.message.playerName, gname: this.stateManager.gameName})});
          namedPlayer.setState(this.playerStates.standingBy);
        }
        this.eventService.publish(this.gameEvents.updatePlayers, this.players);
        if(this.activePlayers>=this.minimumPlayers && this.stateManager.checkState(this.gameStates.WaitingForStart) && this.gameWasNamed){
          this.stateManager.setState(this.gameStates.WaitingForReady);
        }
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
      _.findWhere(this.players, {playerId: args.playerId/1}).addScore(args.points);
      this.eventService.publish(this.gameEvents.updatePlayers, this.players);
    }

    //establishes that the given player has been guessed
    playerGuessed(args){
      _.findWhere(this.players, {playerId: args.playerId/1}).wasGuessed();
      this.eventService.publish(this.gameEvents.updatePlayers, this.players);
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
      this.eventService.publish(this.gameEvents.updatePlayers, this.players);
    }

    //at the end of game, sets all scores to zero, all players to unguessed
    freshGame(){
      _.each(this.players, player => {
          player.freshGame();
        });
      this.eventService.publish(this.gameEvents.updatePlayers, this.players);
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
      this.eventService.publish(this.gameEvents.updatePlayers, this.players);
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
      for(let quitter in toDrop){
        delete this.players[quitter.playerId];
      }
      this.eventService.publish(this.gameEvents.updatePlayers, this.players);
    }


    playerActed(){
      this.actedPlayersCount++;
    }

    resetPlayerActedCount(){
      this.actedPlayersCount = 0;
      this.removeActedPlayers();
    }

    findPlayerByPlayerId(args){
      return this.players[args];
    }

    findPlayerBySenderId(args){
      for(let player in this.players)
        if(this.players[player].senderId === args) return this.players[player];
      return null;
    }

    updatePlayers(){
      let playerList = [];
      for(let player in this.players){
        playerList.push(this.players[player]);
      }
      this.eventService.publish(this.gameEvents.playersUpdated, playerList);
    }
  }
  playerHandler.$inject = ['gameNumbers', 'eventService', 'playerFactory', 'messageSender', 'stateManager', 'gameEvents', 'gameStates', 'playerStates', 'messageNames', 'messageProvider', '$log'];
  ngModule.service('playerHandler', playerHandler);
}
