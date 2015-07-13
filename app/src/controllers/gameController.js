module.exports = function($scope, $log, $location, gameStates, eventService, gameEvents, player, playerHandler, stateManager, promptProvider) {
 	$scope.gameMessage = "Bar";
 	$scope.gameHeader = "Foo";
	$scope.gameName = stateManager.gameName;
	$scope.ownerName = stateManager.ownerName;
	$scope.players = playerHandler.players;
	$scope.things = [];
	$scope.infoDisplay = null;
	$scope.prompts = promptProvider.currentprompts;
	var incoming = {playerName: "Incoming Player", score: 0};
	// $scope.getState = function(){
	// 	$scope.players = playerHandler.players;
	// 	$scope.gameName = stateManager.gameName;
	// }
	// eventService.subscribe(gameStates.ReadyToStart, $scope.getState);
	$scope.nameGame = function(args){
		$scope.gamename = args;
	}
	eventService.subscribe(gameEvents.gameNamed, $scope.nameGame);
	$scope.addOwner = function(args){
		$scope.owner = args.message.playerName + '\'s';
	}
	eventService.subscribe(gameEvents.gamenameReceived, $scope.addOwner);

	//updates player list
	$scope.updatePlayers = function(newPlayers){
		$scope.players = newPlayers;
	}
	eventService.subscribe(gameEvents.playersUpdated, $scope.updatePlayers);

	//pulls prompts for display
  $scope.grabPrompts = function(args){
  	$scope.prompts=args;
  }
  eventService.subscribe(gameEvents.promptsLoaded, $scope.grabPrompts);

  //highlight a player with pending action

	//remove highlight

	//sort players by score


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
      $scope.players[3].addPoints(5);
  }
  $scope.removePlayer = function(){
  	eventService.publish(gameEvents.quitReceived, {senderId:15});
  }
	$scope.changeView = function(view){
		$location.path(view);
	}
};
