export default ngModule => {
	ngModule.controller('welcomeController', ['$scope', '$log', '$state', 'uiStates', 'gameStates', 'playerStates', 'eventService', 'gameEvents', 'messageProvider', 'messageNames', 'playerHandler', 'gameDriver', 'stateManager', 'fakePlayerProvider',
																							($scope, $log, $state, uiStates, gameStates, playerStates, eventService, gameEvents, messageProvider, messageNames, playerHandler, gameDriver, stateManager, fakePlayerProvider) => {
		$scope.readyPlayers = [];
		$scope.joinedPlayers = [];
		$scope.gameName = "Party Things Demo";
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
  		$state.go(uiStates.gameplay);
  	}
  	eventService.subscribe(gameStates.ReadyToStart, $scope.changeView);
  	eventService.publish(gameEvents.welcomeLoaded, "");

  	      	//TEST VIA BUTTON
		$scope.primeIt = ()=>{
			$scope.incomingPlayer();
			$scope.incomingPlayer();
			$scope.incomingPlayer();
			$scope.incomingPlayer();
			$scope.incomingPlayer();
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
		$scope.incomingPlayerCount = 0;
    $scope.incomingPlayer = ()=>{
	  	eventService.publish(gameEvents.playerJoined, fakePlayerProvider.getJoiningPlayerInitial());
    }
  	$scope.nameIt = ()=>{
  		eventService.publish(gameEvents.gamenameReceived, fakePlayerProvider.getJoiningPlayerDetail());
  	}
		$scope.plusPlayer = ()=>{
			eventService.publish(gameEvents.playernameReceived, fakePlayerProvider.getJoiningPlayerDetail());
    }
    $scope.readyPlayer = ()=>{
    	eventService.publish(gameEvents.readyReceived, $scope.joinedPlayers[0]);
    }
    $scope.removePlayer = ()=>{
			let playerQuitting = _.sample(_.filter(playerHandler.players, function(player){if(player.state!==playerStates.quit)return player;}));
			if(playerQuitting.playerName==="Incoming...")
				fakePlayerProvider.senderIdIndex--;
			eventService.publish(gameEvents.quitReceived, {senderId:playerQuitting.senderId});
    }
	}]);
}
