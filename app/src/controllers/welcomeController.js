export default ngModule => {
	ngModule.controller('welcomeController', ['$scope', '$log', '$location', 'gameStates', 'playerStates', 'eventService', 'gameEvents', 'messageProvider', 'messageNames', 'playerHandler', 'gameDriver', 'stateManager',
																							($scope, $log, $location, gameStates, playerStates, eventService, gameEvents, messageProvider, messageNames, playerHandler, gameDriver, stateManager) => {
		$scope.readyPlayers = [];
		$scope.joinedPlayers = [];
		$scope.gameName = "Party Things";
		$scope.message = "";
		$scope.rules = "";

		//grabs the rules when messages are loaded
		$scope.loadRules = function(){
			$scope.rules = messageProvider.getMessage({messageName: messageNames.rules});
		}
		eventService.subscribe(gameEvents.messagesUpdated, $scope.loadRules);

		//udate screen message
		$scope.updateMessage = function(args){
			if(!stateManager.checkState(gameStates.ReadyToStart)) $scope.message = args.message;
		}
		eventService.subscribe(gameEvents.messagesUpdated, $scope.updateMessage);

		//keeps the player lists updated
		$scope.updatePlayers = function(newPlayers){
			let ready = [];
			let joined = [];
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

		//updates the game name and owner name
		$scope.gameNamed = function(args){
			$scope.gameName = args.gameName;
		}
		eventService.subscribe(gameEvents.gameNamed, $scope.gameNamed);

		//swap to gamePlay view when all players are ready
		$scope.changeView = ()=>{
  		$location.path('/gameplay');
  	}
  	eventService.subscribe(gameStates.ReadyToStart, $scope.changeView);
  	eventService.publish(gameEvents.welcomeLoaded, "");

  	      	//TEST VIA BUTTON
		$scope.primeIt = ()=>{
			$scope.nameIt();
			$scope.plusPlayer();
			$scope.plusPlayer();
			$scope.plusPlayer();
			$scope.plusPlayer();
			$scope.readyPlayer();
			$scope.readyPlayer();
			$scope.readyPlayer();
			$scope.readyPlayer();
			$scope.readyPlayer();
		}
  	$scope.nameIt = ()=>{
  		eventService.publish(gameEvents.gamenameReceived, {senderId:13049823,message:{gamename:"Chuck's Palace",playerName: "Chuck"}});
  	}
  	$scope.count = 0;
  	$scope.list = [{senderId:52,message:{playerName:"Harry Dresden"}},
			{senderId:15,message:{playerName:"Rose"}},
			{senderId:25234,message:{playerName:"Mikey"}},
			{senderId:157,message:{playerName:"Billy"}},
			{senderId:972343,message:{playerName:"Geraldine"}},
			{senderId:5122,message:{playerName:"Milly"}},
			{senderId:125,message:{playerName:"Joe"}},
			{senderId:255234,message:{playerName:"Alan Parsons"}},
			{senderId:1547,message:{playerName:"Mary Jane"}},
			{senderId:9872343,message:{playerName:"Peter Parker"}},
			{senderId:572,message:{playerName:"Steve Rodgers"}},
			{senderId:998,message:{playerName:"Nick Fury"}},
			{senderId:997,message:{playerName:"Professor Xavier"}},
			{senderId:996,message:{playerName:"Derpina"}},
			{senderId:995,message:{playerName:"Derp"}}];
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
    	eventService.publish(gameEvents.quitReceived, {senderId:_.sample(playerHandler.players).senderId});
    }
	}]);
}
