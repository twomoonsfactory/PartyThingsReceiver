module.exports = function($scope, $log, $location, stateManager, gameStates, playerStates, eventService, gameEvents, messageProvider, messageNames, playerHandler, playerStates, gameDriver) {
	$scope.readyPlayers = [];
	$scope.joinedPlayers = [];
  $scope.winners = stateManager.winners;
  $scope.score = stateManager.score;
	$scope.gameName = stateManager.gameName;
	$scope.message = stateManager.message;
  $scope.banner = stateManager.banner;

	//keeps the player lists updated
	$scope.updatePlayers = function(newPlayers){
		var ready = [];
		var joined = [];
		_.forEach(newPlayers, function(player){
			if(player.state!==playerStates.quit){
				if(player.state===playerStates.ready)
					ready.push(player);
				else
					joined.push(player);
			}
		});
		$scope.readyPlayers = ready;
		$scope.joinedPlayers = joined;
	}
	eventService.subscribe(gameEvents.playersUpdated, $scope.updatePlayers);

	//swap to gamePlay view when all players are quit or ready
	$scope.changeView = function(){
		$location.path('/gameplay');
	}
	eventService.subscribe(gameStates.ReadyToStart, $scope.changeView);
	eventService.publish(gameEvents.welcomeLoaded, "");

  	      	//TEST VIA BUTTON
	$scope.count = 0;
	$scope.list = [{senderId:52,message:{playerName:"Franky"}},
				{senderId:15,message:{playerName:"Rose"}},
				{senderId:025234,message:{playerName:"N3tSlayùù│A"}},
				{senderId:157,message:{playerName:"Billy"}},
				{senderId:0972343,message:{playerName:"Geraldine"}},
				{senderId:5122,message:{playerName:"Milly"}},
				{senderId:125,message:{playerName:"Joe"}},
				{senderId:0255234,message:{playerName:"AlanParsons"}},
				{senderId:1547,message:{playerName:"Mary Jane"}},
				{senderId:09872343,message:{playerName:"Peter Parker"}},
				{senderId:572,message:{playerName:"Steve Rodgers"}},
				{senderId:157,message:{playerName:"Nick Fury"}},
				{senderId:0258234,message:{playerName:"Professor Xavier"}},
				{senderId:1557,message:{playerName:"Derpina"}},
				{senderId:09762343,message:{playerName:"Derp"}}];
	$scope.plusPlayer = function(){
		eventService.publish(gameEvents.playernameReceived, $scope.list[$scope.count]);
		$scope.count++;
  }
  $scope.readyPlayer = function(){
  	eventService.publish(gameEvents.readyReceived, $scope.joinedPlayers[0]);
  }
  $scope.incomingPlayer = function(){
  	eventService.publish(gameEvents.playerJoined, {});
  }
  $scope.removePlayer = function(){
  	eventService.publish(gameEvents.quitReceived, {senderId:_.sample(_.filter(playerHandler.players, function(player){
      if(player.state!==playerStates.quit)
        return player;
    }))});
  }
};
