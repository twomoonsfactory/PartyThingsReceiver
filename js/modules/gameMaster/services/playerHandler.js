angular.module('gameMaster')
//player handler keeps track of player information
.service('playerHandler', ['eventService', 'player', 'messageSender', 'stateManager', 'gameEvents', 'gameStates', 'playerStates', '$log',
 function(eventService, player, messageSender, stateManager, gameEvents, gameStates, playerStates, $log){
  var self = this;
  this.players = [];          //contains all players of the game
  this.playerCounter = 0;     //keeps players assigned sequentially
  this.actedPlayersCount = 0;        //how many players have participated in the current state
  this.activePlayers = 0;     //the number of players currently playing -- should it be moved to the playerHandler?
  this.minimumPlayers = 5;    //the minimum number of players to start the game
    
  //this is where new players are added to the game
  this.addPlayer = function(args){
    if(stateManager.checkState(null)){
      messageSender.requestGameName({senderId: args.senderId, message: messageProvider.getMessage({messageName: messageNames.nameGame})});
      stateManager.setState(gameStates.WaitingForStart);
    }
    else{
      messageSender.requestPlayerName({senderId: args.senderId, message: messageProvider.getMessage({messageName: messageNames.namePlayer, gname: stateManager.gameName})});
    }
  }
  eventService.subscribe(gameEvents.playerJoined, this.addPlayer);

  //this is where the game is names and the first player is created
  this.gameNamed = function(args){
    stateManager.gameName = args.message.gamename;
    self.playerNamed(args);
  }
  eventService.subscribe(gameEvents.gamenameReceived, this.gameNamed);

  //this is where new players are created and assigned a state appropriate to the game's state, ready requests even being handled.
  //Need error handling for duplicate player names, as it can create confusion
  this.playerNamed = function(args){
    self.players[self.playerCounter]= new player(args.message.playerName, args.senderId, self.playerCounter);
    if(stateManager.checkState(gameStates.WaitingForStart)){
      messageSender.requestPlayerName({senderId: args.senderId, message: messageProvider.getMessage({messageName: messageNames.waitingToStart, pname: args.message.playerName, gname: stateManager.gameName})});
      self.players[self.playerCounter].setState(playerStates.waiting);
    }
    else if(stateManager.checkState(gameStates.WaitingForReady)){
      messageSender.requestReady({senderId: args.senderId, message: messageProvider.getMessage({messageName: messageNames.readyRequest, pname: args.message.playerName})});
      self.players[self.playerCounter].setState(playerStates.readyRequested);
    }
    else{
      messageSender.requestReady({senderId: args.senderId, message: messageProvider.getMessage({messageName: messageNames.standBy, pname: args.message.playerName, gname: stateManager.gameName})});
      self.players[self.playerCounter].setState(playerStates.standingBy);
    }
    if(playerHandler.activePlayers>=self.minimumPlayers){
      stateManager.setState(gameStates.WaitingForReady);
    }
    self.activePlayers++;
  }
  eventService.subscribe(gameEventgameEvents.playernameReceived, this.playerNamed);

  //returns unguessed, still playing players
  this.getElegiblePlayers = function(){
    var elegiblePlayers = [];
    _.each(self.players, function(player){
      if(player.checkState(playerStates.ready) && !player.guessed){
        elegiblePlayers.push = {playerName: player.playerName, playerId: player.playerId};
      }
    });
    return elegiblePlayers;
  }

  //gives players their points, determined in the response handler
  this.assignPoints = function(args){
    self.players[args.playerId].addPoints(args.points);
  }
  
  //establishes that the given player has been guessed
  this.playerGuessed = function(args){
    self.players[args.playerId].wasGuessed();
  }
  
  //returns true if there are more than 1 unguessed players
  this.unguessedPlayers = function(){
    var results = _.countBy(self.players, function(player){
      if(player.guessed === true)
        return guessed;
      else
        return unguessed;
    })
    if(results.guessed > 1)
      return true;
    else
      return false;
  }

  //returns the highest score
  this.highScore = function(){
    var highScore = 0;
    _.each(self.players, function(player){
      if(player.score > highScore)
        highScore = player.score;
      return highScore;
    });
  }

  //returns the player names of the winning player(s)
  this.getWinners = function(){
    var winners = _.filter(self.players, function(player){
      if(player.score===self.highScore){
        return player.playerName;
      }
    });
  }

  //at the end of round, sets all players to unguessed
  this.freshRound = function(){
    _.each(self.players, function(player){
        player.freshRound();
      });
  }
  eventService.subscribe(gameEvents.RoundEnd, this.freshRound);

  //at the end of game, sets all scores to zero, all players to unguessed
  this.freshGame = function(){
    _.each(self.players, function(player){
        player.freshGame();
      });
  }
  eventService.subscribe(gameEvents.GameEnd, this.freshGame);

  //allows the players to quit at any point without seriously disrupting gameplay.  Will still allow for submitted things to be guessed
  //for points, etc.
  this.playerQuit = function(args){
    var quitter = self.findPlayer(args.senderId);
    if(quitter.checkState(playerStates.ready))
      self.actedPlayersCount--;
    playerHandler.activePlayers--;
    //logic to remove quit player from on screen display here
    quitter.setState(playerStates.quit);
    messageSender({senderId: quitter.senderId, message: messageProvider.getMessage({messageName: messageNames.quit, pname: quitter.playerName})});
  }
  eventService.subscribe(gameEvents.quitReceived, this.playerQuit);

  this.playerActed = function(){
    self.actedPlayersCount++;
  }

  this.resetPlayerActedCount = function(){
    self.actedPlayersCount = 0;
  }

  this.findPlayer = function(senderId){
    var foundPlayer = _.findWhere(self.players, function(player){return player.senderId===args.senderId;});
    return foundPlayer;
  }
}]);