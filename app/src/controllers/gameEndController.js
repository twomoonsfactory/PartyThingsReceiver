export default ngModule => {
		ngModule.controller('gameEndController', ['$scope', '$log', '$state', 'uiStates', 'stateManager', 'gameStates', 'playerStates', 'eventService', 'gameEvents', 'messageProvider', 'messageNames', 'playerHandler', 'gameDriver', ($scope, $log, $state, uiStates, stateManager, gameStates, playerStates, eventService, gameEvents, messageProvider, messageNames, playerHandler, gameDriver) => {
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
			$state.go(uiStates.gameplay);
		}
		eventService.subscribe(gameStates.ReadyToStart, $scope.changeView);
		eventService.publish(gameEvents.welcomeLoaded, "");

	  	      	//TEST VIA BUTTON
		$scope.count = 0;
		$scope.list = [{senderId:522,message:{playerName:"Fran"}},
					{senderId:152,message:{playerName:"Rosalina"}},
					{senderId:2215234,message:{playerName:"Sir Alec Guiness"}},
					{senderId:15147,message:{playerName:"Billybob Thornton"}},
					{senderId:9721343,message:{playerName:"Geriatric"}}];
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
