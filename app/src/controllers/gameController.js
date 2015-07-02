module.exports = function($scope, $log, $location, gameStates, eventService, gameEvents, player, playerHandler, stateManager) {
 	$scope.gameMessage = "Bar";
 	$scope.gameHeader = "Foo";
  	$scope.gameName = stateManager.gameName;
  	$scope.ownerName = stateManager.ownerName;
  	$scope.players = playerHandler.players;		
  	$scope.things = [];
  	$scope.infoDisplay = null;
  	$scope.prompts;
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

  	//adds "pending player"
  	$scope.pendPlayer = function(){
  		if(!_.contains($scope.players, incoming))
  			$scope.players.push(incoming);
  	}
  	eventService.subscribe(gameEvents.playerJoined, $scope.pendPlayer);
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
  	$scope.nameIt = function(){
  		eventService.publish(gameEvents.playerJoined, {senderId:5});
  		eventService.publish(gameEvents.gamenameReceived, {senderId:13049823,message:{gamename:"Chuck's Palace",playerName: "Chuck"}});
  	}
  	$scope.count = 0;
	$scope.plusPlayer = function(){
		var list = [{senderId:52,message:{playerName:"Franky"}},
					{senderId:15,message:{playerName:"Rose"}},
					{senderId:025234,message:{playerName:"N3tSlayùù│A"}},
					{senderId:157,message:{playerName:"Billy"}},
					{senderId:0972343,message:{playerName:"Geraldine"}}];
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
