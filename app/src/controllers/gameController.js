export default ngModule => {
  ngModule.controller('gameController', ['$scope', '$log', '$location', 'gameStates', 'eventService', 'gameEvents', 'player', 'playerHandler', 'stateManager', 'promptProvider', 'responseHandler', ($scope, $log, $location, gameStates, eventService, gameEvents, player, playerHandler, stateManager, promptProvider, responseHandler) => {
    //many of these dependencies can be chunked once button testing is no loner in use
   	$scope.gameMessage = stateManager.message;
   	$scope.gameHeader = stateManager.banner;
  	$scope.gameName = stateManager.gameName;
  	$scope.ownerName = stateManager.ownerName;
  	$scope.players = playerHandler.players;
    $scope.currentState = null;
  	$scope.prompts = promptProvider.currentprompts;
    $scope.finalPrompt;
    $scope.resposes = [];
  	$scope.guesses = [];
    $scope.winners = [];

    $scope.updateMessages = (args) => {
      $scope.gameMessage = args.message;
      $scope.gameHeader = args.banner;
    }
    eventService.subscribe(gameEvents.messagesUpdated, $scope.updateMessages);

  	//updates player list
  	$scope.updatePlayers = (newPlayers) => {
  		$scope.players = newPlayers;
  	}
  	eventService.subscribe(gameEvents.playersUpdated, $scope.updatePlayers);

  	//pulls prompts for display
    $scope.grabPrompts = (args) => {
    	$scope.prompts = args;
    }
    eventService.subscribe(gameEvents.promptsLoaded, $scope.grabPrompts);

    //gets final prompt for display
    $scope.getFinalPrompt = ()=>{
      $scope.finalPrompt = promptProvider.prompt;
      $scope.currentState = gameStates.PromptChosen;
    }
    eventService.subscribe(gameStates.PromptChosen, $scope.getFinalPrompt);

    //gets responses for display
    $scope.getResponses = ()=>{
      $scope.responses = responseHandler.getResponses();
      $scope.currentState = gameStates.ResponsesReceived;
    }
    eventService.subscribe(gameStates.ResponsesReceived, $scope.getResponses);

    //gets guesses for display and resolution
    $scope.getGuesses = (args) => {
      $scope.guesses = args;
      $scope.currentState = gameEvents.guessesSorted;
    }
    eventService.subscribe(gameEvents.guessesSorted, $scope.getGuesses);

    //restarts the round
    $scope.newRound = ()=>{
      $scope.currentState = gameStates.ReadyToStart;
    }
    eventService.subscribe(gameStates.ReadyToStart, $scope.newRound);

    //ends the game
    // $scope.endDisplay = ()=>{
    //   $scope.winners = playerHandler.getWinners();
    //   $scope.currentState = gameStates.GameEnd;
    // }
    // eventService.subscribe(gameEvents.GameEnd, $scope.endDisplay);

    $scope.changeView = ()=>{
      eventService.publish(gameEvents.newGameRequested, "");
      stateManager.updateMessages();
  		$location.path('/gameEnd');
  	}
  	eventService.subscribe(gameEvents.endView, $scope.changeView);



    //keeps
  	//TEST VIA BUTTON
  	$scope.count = 0;
  	$scope.plusPlayer = ()=>{
    	let list = [{senderId:522,message:{playerName:"Fran"}},
    				{senderId:152,message:{playerName:"Rosalina"}},
    				{senderId:2215234,message:{playerName:"Sir Alec Guiness"}},
    				{senderId:15147,message:{playerName:"Billybob Thornton"}},
    				{senderId:9721343,message:{playerName:"Geriatric"}}];
    	eventService.publish(gameEvents.playernameReceived, list[$scope.count]);
    	$scope.count++;
    }
    $scope.incomingPlayer = ()=>{
    	eventService.publish(gameEvents.playerJoined, {});
    }
    $scope.morePoints = ()=>{
        playerHandler.assignPoints({playerId:_.sample(playerHandler.players).playerId,points: 5});
    }
    $scope.removePlayer = ()=>{
    	eventService.publish(gameEvents.quitReceived, {senderId:_.sample(_.filter(playerHandler.players, function(player){return player.state!=="quit"})).senderId});
    }
    $scope.sendVotes = ()=>{
      eventService.publish(gameEvents.voteReceived, {senderId:_.sample(_.filter(playerHandler.players, function(player){return player.state==="voting"})).senderId, message:{promptIndex:_.sample([1,2,3])}});
    }
    $scope.sendResponses = ()=>{
      let responses = ["The ministry of silly walks.", "The first dog president.", "Foo", "Bar", "I have no idea."];
      eventService.publish(gameEvents.responseReceived, {senderId: _.sample(_.filter(playerHandler.players, function(player){return player.state==='writing'})).senderId, message: {response: _.sample(responses)}});
    }
    $scope.sendGuesses = ()=>{
      eventService.publish(gameEvents.guessReceived, {senderId: _.sample(_.filter(playerHandler.players, function(player){return player.state==='guessing'})).senderId, message: {playerId: _.sample(_.filter(playerHandler.players, function(player){return player.guessed===false})).playerId, responseId:_.sample(responseHandler.getResponses()).responseId}})
    }
    $scope.kingMaker = ()=>{
      playerHandler.assignPoints({playerId:   _.sample(playerHandler.players).playerId, points: 100});
    }
    $scope.skipToEnd = ()=>{
      eventService.publish(gameStates.RoundEnd, "");
    }
  }]);
}
