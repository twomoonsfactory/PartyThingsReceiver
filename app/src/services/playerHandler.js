export default ngModule => {
  ngModule.service('playerHandler', ['eventService', 'player', 'messageSender', 'stateManager', 'gameEvents', 'gameStates', 'playerStates', 'messageNames', 'messageProvider', '$log', (eventService, player, messageSender, stateManager, gameEvents, gameStates, playerStates, messageNames, messageProvider, $log) => {
    let self = this;
    this.players = [];          //contains all players of the game
    this.playerCounter = 0;     //keeps players assigned sequentially
    this.actedPlayersCount = 0;        //how many players have participated in the current state
    this.activePlayers = 0;     //the number of players currently playing -- should it be moved to the playerHandler?
    this.minimumPlayers = 5;    //the minimum number of players to start the game
    this.joinedPlayers = 0;     //the number of players joined, named or not.  Used for "incoming player"
    this.incoming = new player("Incoming Player", 111);

    //this is where new players are added to the game
    this.addPlayer = args => {
      if(stateManager.checkState(null)){
        messageSender.requestGameName({senderId: args.senderId, message: messageProvider.getMessage({messageName: messageNames.nameGame})});
      }
      else{
        messageSender.requestPlayerName({senderId: args.senderId, message: messageProvider.getMessage({messageName: messageNames.namePlayer, gname: stateManager.gameName})});
      }
      self.joinedPlayers++;
      eventService.publish(gameEvents.playerUpdated, "");
    }
    eventService.subscribe(gameEvents.playerJoined, this.addPlayer);

    //this is where the game is named and the first player is created
    this.gameNamed = args => {
      stateManager.gameName = args.message.gamename;
      eventService.publish(gameEvents.gameNamed, {gameName: args.message.gamename, ownerName: args.message.playerName});
      self.playerNamed(args);
    }
    eventService.subscribe(gameEvents.gamenameReceived, this.gameNamed);

    this.pendPlayer = args => {

    }

    //this is where new players are created and assigned a state appropriate to the game's state, ready requests even being handled.
    //Need error handling for duplicate player names, as it can create confusion
    this.playerNamed = args => {
      self.players[self.playerCounter]= new player(args.message.playerName, args.senderId, self.playerCounter);
      if(stateManager.checkState(gameStates.WaitingForStart)){
        messageSender.requestPlayerName({senderId: args.senderId, message: messageProvider.getMessage({messageName: messageNames.waitingToStart, pname: args.message.playerName, gname: stateManager.gameName})});
        self.players[self.playerCounter].setState(playerStates.waiting);
        self.activePlayers++;
      }
      else if(stateManager.checkState(gameStates.WaitingForReady)){
        messageSender.requestReady({senderId: args.senderId, message: messageProvider.getMessage({messageName: messageNames.readyRequest, pname: args.message.playerName})});
        self.players[self.playerCounter].setState(playerStates.readyRequested);
        self.activePlayers++;
      }
      else{
        messageSender.sendStandby({senderId: args.senderId, message: messageProvider.getMessage({messageName: messageNames.standby, pname: args.message.playerName, gname: stateManager.gameName})});
        self.players[self.playerCounter].setState(playerStates.standingBy);
      }
      self.playerCounter++;
      eventService.publish(gameEvents.playerUpdated, "");
      if(self.activePlayers>=self.minimumPlayers&&stateManager.checkState(gameStates.WaitingForStart)){
        stateManager.setState(gameStates.WaitingForReady);
      }
    }
    eventService.subscribe(gameEvents.playernameReceived, this.playerNamed);

    //returns unguessed, still playing players
    this.getElegiblePlayers = ()=>{
      let elegiblePlayers = [];
      _.each(self.players, player => {
        if(player.checkState(playerStates.ready) && !player.guessed)
          elegiblePlayers.push({playerName: player.playerName, playerId: player.playerId});

      });
      return elegiblePlayers;
    }

    //gives players their points, determined in the response handler
    this.assignPoints = args => {
      _.findWhere(self.players, {playerId: args.playerId}).addPoints(args.points);
      eventService.publish(gameEvents.playerUpdated, "");
    }

    //establishes that the given player has been guessed
    this.playerGuessed = args => {
      _.findWhere(self.players, {playerId: args.playerId}).wasGuessed();
      eventService.publish(gameEvents.playerUpdated, "");
    }

    //returns true if there are more than 1 unguessed players
    this.unguessedPlayers = ()=>{
      let results = _.countBy(self.players, player => {
        return player.guessed === true ? 'guessed' : 'unguessed';
      })
      return results.unguessed > 1 ? true : false;
    }

    //returns the highest score
    this.highScore = ()=>{
      let highScore = 0;
      _.each(self.players, player => {
        highScore = player.score > highScore ? player.score : highScore;
      });
      return highScore;
    }

    //returns the player names of the winning player(s)
    this.getWinners = ()=>{
      let winners = [];
      _.each(self.players, player => {
        if(player.score===self.highScore())
          winners.push(player.playerName);
      });
      return winners;
    }

    //at the end of round, sets all players to unguessed
    this.freshRound = ()=>{
      if(self.getWinners().length===0){
        _.each(self.players, player => {
          player.freshRound();
        });
      }
    }
    eventService.subscribe(gameStates.RoundEnd, this.freshRound);

    //at the end of game, sets all scores to zero, all players to unguessed
    this.freshGame = ()=>{
      _.each(self.players, player => {
          player.freshGame();
        });
    }
    eventService.subscribe(gameStates.GameEnd, this.freshGame);

    //allows the players to quit at any point without seriously disrupting gameplay.  Will still allow for submitted things to be guessed
    //for points, etc.
    this.playerQuit = args => {
      let quitter = self.findPlayer(args.senderId);
      if(quitter.checkState(playerStates.ready))
        self.actedPlayersCount--;
      self.activePlayers--;
      //logic to remove quit player from on screen display here
      quitter.setState(playerStates.quit);
      messageSender.sendQuit({senderId: quitter.senderId, message: messageProvider.getMessage({messageName: messageNames.quit, pname: quitter.playerName})});
      eventService.publish(gameEvents.playerUpdated, "");
    }
    eventService.subscribe(gameEvents.quitReceived, this.playerQuit);

    //actually drops the quit players altogether
    this.dropQuitPlayers = ()=>{
      let toDrop = [];
      _.each(self.players, player => {
        if(player.checkState(playerStates.quit))
          toDrop.push(player);
      });
      self.players = _.difference(self.players, toDrop);
      eventService.publish(gameEvents.playersUpdated);
    }
    eventService.subscribe(gameEvents.newGameRequested, this.dropQuitPlayers);
    eventService.subscribe(gameStates.ReadyToStart, this.dropQuitPlayers);


    this.playerActed = ()=>{
      self.actedPlayersCount++;
    }

    this.resetPlayerActedCount = ()=>{
      self.actedPlayersCount = 0;
    }

    this.findPlayer = args => {
      let foundPlayer = _.find(self.players, player => player.senderId===args);
      return foundPlayer;
    }

    this.playerUpdated = ()=>{
      if(self.joinedPlayers>self.playerCounter){ //meaning there are still player(s) joining who aren't yet named
        if(_.last(self.players)!==self.incoming){
          self.players[self.playerCounter] = self.incoming;
          self.players[self.playerCounter].setState(playerStates.incoming);
        }
      }
      else if(self.incoming===(_.last(self.players))){ //otherwise it drops the "incoming" player if present
        self.players.splice(self.players.length-1, 1);
      }
      eventService.publish(gameEvents.playersUpdated, self.players);
    }
    eventService.subscribe(gameEvents.playerUpdated, this.playerUpdated);
    eventService.subscribe(gameEvents.welcomeLoaded, this.playerUpdated);
  }])
}
