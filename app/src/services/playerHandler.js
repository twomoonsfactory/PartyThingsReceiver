export default class playerHandler{
  constructor(eventService, player, messageSender, stateManager, gameEvents, gameStates, playerStates, messageNames, messageProvider, $log){
    //local references to externals
    this.eventService = eventService;
    this.player = player;
    this.messageSender = messageSender;
    this.stateManger = stateManager;
    this.gameEvents = gameEvents;
    this.gameStates = gameStates;
    this.playerStates = playerStates;
    this.messageNames = messageNames;
    this.messageProvider = messageProvider;
    this.log = $log;
    //local veriables
    this.players = [];          //contains all players of the game
    this.playerCounter = 0;     //keeps players assigned sequentially
    this.actedPlayersCount = 0;        //how many players have participated in the current state
    this.activePlayers = 0;     //the number of players currently playing -- should it be moved to the playerHandler?
    this.minimumPlayers = 5;    //the minimum number of players to start the game
    this.joinedPlayers = 0;     //the number of players joined, named or not.  Used for "incoming player"
    this.incoming = new this.player("Incoming Player", 111);

    //set event subscriptions
    this.eventService.subscribe(this.gameEvents.playerJoined, this.addPlayer);
    this.eventService.subscribe(this.gameEvents.gamenameReceived, this.gameNamed);
    this.eventService.subscribe(this.gameEvents.playernameReceived, this.playerNamed);
    this.eventService.subscribe(this.gameStates.RoundEnd, this.freshRound);
    this.eventService.subscribe(this.gameEvents.quitReceived, this.playerQuit);
    this.eventService.subscribe(this.gameStates.GameEnd, this.freshGame);
    this.eventService.subscribe(this.gameEvents.newGameRequested, this.dropQuitPlayers);
    this.eventService.subscribe(this.gameStates.ReadyToStart, this.dropQuitPlayers);
    this.eventService.subscribe(this.gameEvents.playerUpdated, this.playerUpdated);
    this.eventService.subscribe(this.gameEvents.welcomeLoaded, this.playerUpdated);
  }
  //this is where new players are added to the game
  addPlayer(args){
    if(this.stateManager.checkState(null)){
      this.messageSender.requestGameName({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.nameGame})});
    }
    else{
      this.messageSender.requestPlayerName({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.namePlayer, gname: this.stateManager.gameName})});
    }
    this.joinedPlayers++;
    this.eventService.publish(this.gameEvents.playerUpdated, "");
  }

  //this is where the game is named and the first player is created
  gameNamed(args){
    this.stateManager.gameName = args.message.gamename;
    this.eventService.publish(this.gameEvents.gameNamed, {gameName: args.message.gamename, ownerName: args.message.playerName});
    this.playerNamed(args);
  }

  //this is where new players are created and assigned a state appropriate to the game's state, ready requests even being handled.
  //Need error handling for duplicate player names, as it can create confusion
  playerNamed(args){
    this.players[this.playerCounter]= new this.player(args.message.playerName, args.senderId, this.playerCounter);
    if(this.stateManager.checkState(this.gameStates.WaitingForStart)){
      this.messageSender.requestPlayerName({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.waitingToStart, pname: args.message.playerName, gname: this.stateManager.gameName})});
      this.players[this.playerCounter].setState(this.playerStates.waiting);
      this.activePlayers++;
    }
    else if(this.stateManager.checkState(this.gameStates.WaitingForReady)){
      this.messageSender.requestReady({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.readyRequest, pname: args.message.playerName})});
      this.players[this.playerCounter].setState(this.playerStates.readyRequested);
      this.activePlayers++;
    }
    else{
      this.messageSender.sendStandby({senderId: args.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.standby, pname: args.message.playerName, gname: this.stateManager.gameName})});
      this.players[this.playerCounter].setState(this.playerStates.standingBy);
    }
    this.playerCounter++;
    this.eventService.publish(this.gameEvents.playerUpdated, "");
    if(this.activePlayers>=this.minimumPlayers&&this.stateManager.checkState(this.gameStates.WaitingForStart)){
      this.stateManager.setState(this.gameStates.WaitingForReady);
    }
  }

  //returns unguessed, still playing players
  getElegiblePlayers(){
    let elegiblePlayers = [];
    _.each(this.players, player => {
      if(player.checkState(this.playerStates.ready) && !player.guessed)
        elegiblePlayers.push({playerName: player.playerName, playerId: player.playerId});

    });
    return elegiblePlayers;
  }

  //gives players their points, determined in the response handler
  assignPoints(args){
    _.findWhere(this.players, {playerId: args.playerId}).addPoints(args.points);
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
      return player.guessed === true ? 'guessed' : 'unguessed';
    })
    return results.unguessed > 1 ? true : false;
  }

  //returns the highest score
  highScore(){
    let highScore = 0;
    _.each(this.players, player => {
      highScore = player.score > highScore ? player.score : highScore;
    });
    return highScore;
  }

  //returns the player names of the winning player(s)
  getWinners(){
    let winners = [];
    _.each(this.players, player => {
      if(player.score===this.highScore())
        winners.push(player.playerName);
    });
    return winners;
  }

  //at the end of round, sets all players to unguessed
  freshRound(){
    if(this.getWinners().length===0){
      _.each(this.players, player => {
        player.freshRound();
      });
    }
  }

  //at the end of game, sets all scores to zero, all players to unguessed
  freshGame(){
    _.each(this.players, player => {
      player.freshGame();
    });
  }

  //allows the players to quit at any point without seriously disrupting gameplay.  Will still allow for submitted things to be guessed
  //for points, etc.
  playerQuit(args){
    let quitter = this.findPlayer(args.senderId);
    if(quitter.checkState(this.playerStates.ready))
      this.actedPlayersCount--;
    this.activePlayers--;
    //logic to remove quit player from on screen display here
    quitter.setState(this.playerStates.quit);
    this.messageSender.sendQuit({senderId: quitter.senderId, message: this.messageProvider.getMessage({messageName: this.messageNames.quit, pname: quitter.playerName})});
    this.eventService.publish(this.gameEvents.playerUpdated, "");
  }

  //actually drops the quit players altogether
  dropQuitPlayers(){
    let toDrop = [];
    _.each(this.players, player => {
      if(player.checkState(this.playerStates.quit))
        toDrop.push(player);
    });
    this.players = _.difference(this.players, toDrop);
    this.eventService.publish(this.gameEvents.playersUpdated);
  }

  //for external set
  playerActed(){
    this.actedPlayersCount++;
  }

  //for external reset
  resetPlayerActedCount(){
    this.actedPlayersCount = 0;
  }

  //often reused code
  findPlayer(args){
    let foundPlayer = _.find(this.players, player => player.senderId===args);
    return foundPlayer;
  }

  //used to pass on player updates
  playerUpdated(){
    if(this.joinedPlayers>this.playerCounter){ //meaning there are still player(s) joining who aren't yet named
      if(_.last(this.players)!==this.incoming){
        this.players[this.playerCounter] = this.incoming;
        this.players[this.playerCounter].setState(this.playerStates.incoming);
      }
    }
    else if(this.incoming===(_.last(this.players))){ //otherwise it drops the "incoming" player if present
      this.players.splice(this.players.length-1, 1);
    }
    this.eventService.publish(this.gameEvents.playersUpdated, this.players);
  }
}
playerHandler.$inject = ['eventService', 'player', 'messageSender', 'stateManager', 'gameEvents', 'gameStates', 'playerStates', 'messageNames', 'messageProvider', '$log'];
