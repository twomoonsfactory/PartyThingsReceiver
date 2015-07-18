module.exports = function($scope, $log, $location, gameStates, eventService, gameEvents, player, playerHandler, stateManager, promptProvider, responseHandler) {
  //many of these dependencies can be chunked once button testing is no loner in use
 	$scope.gameMessage = stateManager.message;
 	$scope.gameHeader = stateManager.banner;
	$scope.gameName = stateManager.gameName;
	$scope.ownerName = stateManager.ownerName;
	$scope.players = playerHandler.players;
	$scope.resposes = [];
  $scope.currentState = null;
	$scope.infoDisplay = null;
	$scope.prompts = promptProvider.currentprompts;
  $scope.finalPrompt;
	var incoming = {playerName: "Incoming Player", score: 0};

  $scope.updateMessages = function(args){
    $scope.gameMessage = args.message;
    $scope.gameHeader = args.banner;
  }
  eventService.subscribe(gameEvents.messagesUpdated, $scope.updateMessages);

	//updates player list
	$scope.updatePlayers = function(newPlayers){
		$scope.players = newPlayers;
	}
	eventService.subscribe(gameEvents.playersUpdated, $scope.updatePlayers);

	//pulls prompts for display
  $scope.grabPrompts = function(args){
  	$scope.prompts = args;
  }
  eventService.subscribe(gameEvents.promptsLoaded, $scope.grabPrompts);

  //gets final prompt for display
  $scope.getFinalPrompt = function(){
    $scope.finalPrompt = promptProvider.prompt;
    $scope.currentState = gameStates.PromptChosen;
  }
  eventService.subscribe(gameStates.PromptChosen, $scope.getFinalPrompt);

  $scope.getResponses = function(){
    $scope.responses = responseHandler.getResponses();
    $scope.currentState = gameStates.ResponsesReceived;
  }
  eventService.subscribe(gameStates.ResponsesReceived, $scope.getResponses);

  //keeps
	//TEST VIA BUTTON
	$scope.count = 0;
	$scope.plusPlayer = function(){
  	var list = [{senderId:522,message:{playerName:"Fran"}},
  				{senderId:152,message:{playerName:"Rosalina"}},
  				{senderId:02215234,message:{playerName:"N3tasg131Slayùù│A"}},
  				{senderId:15147,message:{playerName:"BillyBb"}},
  				{senderId:09721343,message:{playerName:"Geriatric"}}];
  	eventService.publish(gameEvents.playernameReceived, list[$scope.count]);
  	$scope.count++;
  }
  $scope.incomingPlayer = function(){
  	eventService.publish(gameEvents.playerJoined, {});
  }
  $scope.morePoints = function(){
      playerHandler.assignPoints({playerId:_.sample(playerHandler.players).playerId,points: 5});
  }
  $scope.removePlayer = function(){
  	eventService.publish(gameEvents.quitReceived, {senderId:_.sample(_.filter(playerHandler.players, function(player){return player.state!=="quit"})).senderId});
  }
	$scope.changeView = function(view){
		$location.path(view);
	}
  $scope.sendVotes = function(){
    eventService.publish(gameEvents.voteReceived, {senderId:_.sample(_.filter(playerHandler.players, function(player){return player.state==="voting"})).senderId, message:{promptIndex:_.sample([1,2,3])}});
  }
  $scope.sendResponses = function(){
    var responses = ["The ministry of silly walks.", "The first dog president.", "Foo", "Bar", "I have no idea."];
    eventService.publish(gameEvents.responseReceived, {senderId: _.sample(_.filter(playerHandler.players, function(player){return player.state==='writing'})).senderId, message: {response: _.sample(responses)}});
  }
  $scope.sendGuesses = function(){
    eventService.publish(gameEvents.guessReceived, {senderId: _.sample(_.filter(playerHandler.players, function(player){return player.state==='guessing'})).senderId, message: {playerId: _.sample(_.filter(playerHandler.players, function(player){return player.guessed===false})).playerId, responseId:_.sample(responseHandler.getResponses()).responseId}})
  }
};
