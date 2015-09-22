export default ngModule => {
		ngModule.controller('gameEndController', ['$scope', '$log', '$location', 'stateManager', 'gameStates', 'playerStates', 'eventService', 'gameEvents', 'messageProvider', 'messageNames', 'playerHandler', 'gameDriver', ($scope, $log, $location, stateManager, gameStates, playerStates, eventService, gameEvents, messageProvider, messageNames, playerHandler, gameDriver) => {
		$scope.readyPlayers = [];
		$scope.joinedPlayers = [];
	  $scope.winners = stateManager.winners;
	  $scope.score = stateManager.score;
		$scope.gameName = stateManager.gameName;
		$scope.message = stateManager.message;
	  $scope.banner = stateManager.banner;

		//keeps the player lists updated
		$scope.updatePlayers = (newPlayers) => {
			let ready = [];
			let joined = [];
			_.forEach(newPlayers, (player) => {
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
		$scope.changeView = ()=>{
			$location.path('/gameplay');
		}
		eventService.subscribe(gameStates.ReadyToStart, $scope.changeView);
		eventService.publish(gameEvents.welcomeLoaded, "");

	  	      	//TEST VIA BUTTON
		$scope.count = 0;
		$scope.list = [{senderId:52,message:{playerName:"Franky"}},
					{senderId:15,message:{playerName:"Rose"}},
					{senderId:25234,message:{playerName:"N3tSlayùù│A"}},
					{senderId:157,message:{playerName:"Billy"}},
					{senderId:972343,message:{playerName:"Geraldine"}},
					{senderId:5122,message:{playerName:"Milly"}},
					{senderId:125,message:{playerName:"Joe"}},
					{senderId:255234,message:{playerName:"AlanParsons"}},
					{senderId:1547,message:{playerName:"Mary Jane"}},
					{senderId:9872343,message:{playerName:"Peter Parker"}},
					{senderId:572,message:{playerName:"Steve Rodgers"}},
					{senderId:157,message:{playerName:"Nick Fury"}},
					{senderId:258234,message:{playerName:"Professor Xavier"}},
					{senderId:1557,message:{playerName:"Derpina"}},
					{senderId:9762343,message:{playerName:"Derp"}}];
		$scope.plusPlayer = ()=>{
			eventService.publish(gameEvents.playernameReceived, $scope.list[$scope.count]);
			$scope.count++;
	  }
	  $scope.readyPlayer = ()=>{
	  	eventService.publish(gameEvents.readyReceived, $scope.joinedPlayers[0]);
	  }
	  $scope.incomingPlayer = ()=>{
	  	eventService.publish(gameEvents.playerJoined, {});
	  }
	  $scope.removePlayer = ()=>{
	  	eventService.publish(gameEvents.quitReceived, {senderId:_.sample(_.filter(playerHandler.players, function(player){
	      if(player.state!==playerStates.quit)
	        return player;
	    }))});
	  }
	}]);
}
