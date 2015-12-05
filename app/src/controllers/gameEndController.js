export default ngModule => {
		ngModule.controller('gameEndController', ['$scope', '$log', '$state', '$timeout', 'uiStates', 'stateManager', 'gameStates', 'playerStates', 'eventService', 'gameEvents', 'messageProvider', 'messageNames', 'playerHandler', 'gameDriver', 'fakePlayerProvider',
		 																					($scope, $log, $state, $timeout, uiStates, stateManager, gameStates, playerStates, eventService, gameEvents, messageProvider, messageNames, playerHandler, gameDriver, fakePlayerProvider) => {
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
			$timeout(()=>{
        $scope.$apply();
      });
		}
		eventService.subscribe(gameEvents.playersUpdated, $scope.updatePlayers);

		//swap to gamePlay view when all players are quit or ready
		$scope.changeView = ()=>{
			$state.go(uiStates.gameplay);
		}
		eventService.subscribe(gameStates.ReadyToStart, $scope.changeView);
		eventService.publish(gameEvents.welcomeLoaded, "");

  	//TEST VIA BUTTON
		// $scope.incomingPlayersExist = _.findWhere($scope.joinedPlayers, {playerName: 'Incoming...'}) ? true : false;
		// $scope.playersWaitingForReadyCount = 0;
    // $scope.incomingPlayer = ()=>{
	  // 	eventService.publish(gameEvents.playerJoined, fakePlayerProvider.getJoiningPlayerInitial());
		// 	$scope.incomingPlayersExist = true;
    // }
		// $scope.plusPlayer = ()=>{
		// 	eventService.publish(gameEvents.playernameReceived, fakePlayerProvider.getJoiningPlayerDetail(_.sample(_.filter($scope.joinedPlayers, (player)=>{return player.playerName==="Incoming..."})).senderId));
		// 	$scope.incomingPlayersExist = _.findWhere($scope.joinedPlayers, {playerName: 'Incoming...'}) ? true : false;
		// 	$scope.playersWaitingForReadyCount = _.filter($scope.joinedPlayers, (player)=>{return(player.state==='ready'||player.state==='readyRequested')?true:false}).length;
    // }
    // $scope.readyPlayer = ()=>{
    // 	eventService.publish(gameEvents.readyReceived, _.sample(_.filter($scope.joinedPlayers, (player)=>{return (player.state!==playerStates.quit && player.state!==playerStates.incoming)?true:false})));
		// 	$scope.playersWaitingForReadyCount = _.filter($scope.joinedPlayers, (player)=>{return(player.state==='ready'||player.state==='readyRequested')?true:false}).length;
    // }
    // $scope.removePlayer = ()=>{
		// 	let playerQuitting = _.sample(_.filter(playerHandler.players, function(player){if(player.state!==playerStates.quit)return player;}));
		// 	if(playerQuitting.playerName==="Incoming...")
		// 		fakePlayerProvider.senderIdIndex--;
		// 	eventService.publish(gameEvents.quitReceived, {senderId:playerQuitting.senderId});
		// 	$scope.incomingPlayersExist = _.findWhere($scope.joinedPlayers, {playerName: 'Incoming...'}) ? true : false;
		// 	$scope.playersWaitingForReadyCount = _.filter($scope.joinedPlayers, (player)=>{return(player.state==='ready'||player.state==='readyRequested')?true:false}).length;
    // }
	}]);
}
