export default function($scope, $log, $location, gameStates, eventService, gameEvents, playerHandler, stateManager, promptProvider, responseHandler){
  //scope variables
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
  $scope.count = 0;

  //event subscriptions
  eventService.subscribe(gameEvents.messagesUpdated, $scope.updateMessages);
  eventService.subscribe(gameEvents.playersUpdated, $scope.updatePlayers);
  eventService.subscribe(gameEvents.promptsLoaded, $scope.grabPrompts);
  eventService.subscribe(gameStates.PromptChosen, $scope.getFinalPrompt);
  eventService.subscribe(gameStates.ResponsesReceived, $scope.getResponses);
  eventService.subscribe(gameEvents.guessesSorted, $scope.getGuesses);
  eventService.subscribe(gameStates.ReadyToStart, $scope.newRound);
  eventService.subscribe(gameEvents.endView, $scope.changeView);
  //many of these dependencies can be chunked once button testing is no loner in use


  $scope.updateMessages = (args) => {
    scope.gameMessage = args.message;
    scope.gameHeader = args.banner;
  }

	//updates player list
	$scope.updatePlayers = (newPlayers) => {
		$scope.players = newPlayers;
	}

	//pulls prompts for display
  $scope.grabPrompts = (args) => {
  	$scope.prompts = args;
  }

  //gets final prompt for display
  $scope.getFinalPrompt = () => {
    $scope.finalPrompt = promptProvider.prompt;
    $scope.currentState = gameStates.PromptChosen;
  }

  //gets responses for display
  $scope.getResponses = () => {
    $scope.responses = responseHandler.getResponses();
    $scope.currentState = gameStates.ResponsesReceived;
  }

  //gets guesses for display and resolution
  $scope.getGuesses = (args) => {
    $scope.guesses = args;
    $scope.currentState = gameEvents.guessesSorted;
  }

  //restarts the round
  $scope.newRound = () => {
    $scope.currentState = gameStates.ReadyToStart;
  }

  //ends the game
  // scope.endDisplay = ()=>{
  //   scope.winners = playerHandler.getWinners();
  //   scope.currentState = gameStates.GameEnd;
  // }
  // eventService.subscribe(gameEvents.GameEnd, scope.endDisplay);

  $scope.changeView = () => {
    eventService.publish(gameEvents.newGameRequested, "");
    stateManager.updateMessages();
		$location.path('/gameEnd');
	}



  //keeps
	//TEST VIA BUTTON

	$scope.plusPlayer = () => {
  	let list = [{senderId:522,message:{playerName:"Fran"}},
  				{senderId:152,message:{playerName:"Rosalina"}},
  				{senderId:2215234,message:{playerName:"Sir Alec Guiness"}},
  				{senderId:15147,message:{playerName:"Billybob Thornton"}},
  				{senderId:9721343,message:{playerName:"Geriatric"}}];
  	eventService.publish(gameEvents.playernameReceived, list[scope.count]);
  	scope.count++;
  }
  $scope.incomingPlayer = () => {
  	eventService.publish(gameEvents.playerJoined, {});
  }
  $scope.morePoints = () => {
      playerHandler.assignPoints({playerId:_.sample(playerHandler.players).playerId,points: 5});
  }
  $scope.removePlayer = () => {
  	eventService.publish(gameEvents.quitReceived, {senderId:_.sample(_.filter(playerHandler.players, function(player){return player.state!=="quit"})).senderId});
  }
  $scope.sendVotes = () => {
    eventService.publish(gameEvents.voteReceived, {senderId:_.sample(_.filter(playerHandler.players, function(player){return player.state==="voting"})).senderId, message:{promptIndex:_.sample([1,2,3])}});
  }
  $scope.sendResponses = () => {
    let responses = ["The ministry of silly walks.", "The first dog president.", "Foo", "Bar", "I have no idea."];
    eventService.publish(gameEvents.responseReceived, {senderId: _.sample(_.filter(playerHandler.players, function(player){return player.state==='writing'})).senderId, message: {response: _.sample(responses)}});
  }
  $scope.sendGuesses = () => {
    eventService.publish(gameEvents.guessReceived, {senderId: _.sample(_.filter(playerHandler.players, function(player){return player.state==='guessing'})).senderId, message: {playerId: _.sample(_.filter(playerHandler.players, function(player){return player.guessed===false})).playerId, responseId:_.sample(responseHandler.getResponses()).responseId}})
  }
  $scope.kingMaker = () => {
    playerHandler.assignPoints({playerId:   _.sample(playerHandler.players).playerId, points: 100});
  }
  $scope.skipToEnd = () => {
    eventService.publish(gameStates.RoundEnd, "");
  }
}
