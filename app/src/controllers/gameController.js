export default ngModule => {
  ngModule.controller('gameController', ['$scope', '$log', '$state', '$timeout', 'uiStates', 'gameStates', 'eventService', 'gameEvents', 'playerHandler', 'stateManager', 'promptProvider', 'responseHandler', 'responseProvider', 'fakePlayerProvider',
                                          ($scope, $log, $state, $timeout, uiStates, gameStates, eventService, gameEvents, playerHandler, stateManager, promptProvider, responseHandler, responseProvider, fakePlayerProvider) => {
    //many of these dependencies can be chunked once button testing is no loner in use
   	$scope.gameMessage = stateManager.message;
   	$scope.gameHeader = stateManager.banner;
  	$scope.gameName = stateManager.gameName;
  	$scope.ownerName = stateManager.ownerName;
  	$scope.players = [];
    $scope.currentState = null;
    $scope.currentlyGuessing = false;
  	$scope.prompts = promptProvider.currentprompts;
    $scope.finalPrompt;
    $scope.responses = [];
  	$scope.guesses = [];
    $scope.winners = [];

    for(let player in playerHandler.players){
      $scope.players.push(playerHandler.players[player]);
    }

    $scope.updateScreen = () =>{
      $timeout(()=>{
        $scope.$apply();
      });
    }

    $scope.$watch('gameName', ()=>{$log.log($scope.gameName)});

    $scope.updateMessages = (args) => {
      if(!stateManager.checkState(gameStates.GameEnd)){
        $scope.gameMessage = args.message;
        $scope.gameHeader = args.banner;
      }
    }
    eventService.subscribe(gameEvents.messagesUpdated, $scope.updateMessages);

  	//updates player list
  	$scope.updatePlayers = (newPlayers) => {
  		$scope.players = newPlayers;
      $scope.updateScreen();
  	}
  	eventService.subscribe(gameEvents.playersUpdated, $scope.updatePlayers);

  	//pulls prompts for display
    $scope.grabPrompts = (args) => {
    	$scope.prompts = args;
      $scope.updateScreen();
    }
    eventService.subscribe(gameEvents.promptsLoaded, $scope.grabPrompts);

    //gets final prompt for display
    $scope.getFinalPrompt = ()=>{
      $scope.finalPrompt = promptProvider.prompt;
      $scope.currentState = gameStates.PromptChosen;
      $scope.updateScreen();
    }
    eventService.subscribe(gameStates.PromptChosen, $scope.getFinalPrompt);

    //gets responses for display
    $scope.getResponses = ()=>{
      $scope.responses = responseHandler.getResponsesForDisplay();
      $scope.currentState = gameStates.ResponsesReceived;
      $scope.currentlyGuessing = true;
      $scope.updateScreen();
    }
    eventService.subscribe(gameStates.ResponsesReceived, $scope.getResponses);

    //gets guesses for display and resolution
    $scope.getGuesses = (args) => {
      $scope.guesses = _.shuffle(args);
      $scope.updateScreen();
    }
    eventService.subscribe(gameEvents.guessesSorted, $scope.getGuesses);

    //sets screen for end-round
    $scope.endRound = ()=>{
      $scope.currentState = gameStates.GuessesDisplayed;
      $scope.updateScreen();
    }
    eventService.subscribe(gameStates.GuessesDisplayed, $scope.endRound);

    //restarts the round
    $scope.newRound = ()=>{
      $scope.currentState = gameStates.ReadyToStart;
      $scope.guesses = [];
      $scope.currentlyGuessing = false;
      $scope.updateScreen();
    }
    eventService.subscribe(gameStates.ReadyToStart, $scope.newRound);

    //ends the game
    // $scope.endDisplay = ()=>{
    //   $scope.winners = playerHandler.getWinners();
    //   $scope.currentState = gameStates.GameEnd;
    // }
    // eventService.subscribe(gameEvents.GameEnd, $scope.endDisplay);

    $scope.changeView = ()=>{
      eventService.publish(gameEvents.newGameRequested, "");
      stateManager.updateMessages();
  		$state.go(uiStates.gameend);
  	}
  	eventService.subscribe(gameEvents.endView, $scope.changeView);
    $scope.service = playerHandler;
    $scope.$watch('service.players', (newVal, oldVal, scope)=>{
      if(newVal)$log.log('true');
    })


    //keeps
  	//TEST VIA BUTTON
    $scope.incomingPlayersExist = _.findWhere($scope.joinedPlayers, {playerName: 'Incoming...'}) ? true : false;
  	$scope.plusPlayer = ()=>{
      let incomingPlayers = [];
      for(let player in playerHandler.players){
        if(playerHandler.players[player].playerName==="Incoming...")
          incomingPlayers.push(playerHandler.players[player]);
      }
    	eventService.publish(gameEvents.playernameReceived, fakePlayerProvider.getJoiningPlayerDetail(_.sample(incomingPlayers).senderId));
      $scope.incomingPlayersExist = incomingPlayers.length>1?true:false;
    }
    $scope.incomingPlayer = ()=>{
  		eventService.publish(gameEvents.playerIdReceived, fakePlayerProvider.getJoiningPlayerInitial());
      $scope.incomingPlayersExist = true;
    }
    $scope.removePlayer = ()=>{
      let quittablePlayers = [];
      for(let player in playerHandler.players){
        if(playerHandler.players[player].state!=='quit')
          quittablePlayers.push(playerHandler.players[player]);
      }
      let playerQuitting = _.sample(quittablePlayers);
			if(playerQuitting.playerName==="Incoming...")
				fakePlayerProvider.senderIdIndex--;
			eventService.publish(gameEvents.quitReceived, {senderId:playerQuitting.senderId});
      $scope.incomingPlayersExist = false;
      for(let player in playerHandler.players){
        if(playerHandler.players[player].checkState('incoming'))incomingPlayersExist = true;
      }
    }
    $scope.sendVotes = ()=>{
      let votingPlayers = [];
      for(let player in playerHandler.players){
        if(playerHandler.players[player].checkState('voting'))
          votingPlayers.push(playerHandler.players[player]);
      }
      eventService.publish(gameEvents.voteReceived, {senderId:_.sample(votingPlayers).senderId, message:{promptIndex:_.sample([1,2,3])}});
    }
    $scope.sendResponses = ()=>{
      let writingPlayers = [];
      for(let player in playerHandler.players){
        if(playerHandler.players[player].checkState('writing'))
          writingPlayers.push(playerHandler.players[player]);
      }
      eventService.publish(gameEvents.responseReceived, {senderId: _.sample(writingPlayers).senderId, message: {thing: responseProvider.getRandomResponse()}});
    }
    $scope.sendGuesses = ()=>{
      let guessingPlayers = [];
      for(let player in playerHandler.players){
        if(playerHandler.players[player].checkState('guessing'))
          guessingPlayers.push(playerHandler.players[player]);
      }
      eventService.publish(gameEvents.guessReceived, {senderId: _.sample(guessingPlayers).senderId, message: {playerId: _.sample(responseHandler.getAuthors()).playerId, responseId:_.sample(responseHandler.getResponses()).responseId}})
    }
    $scope.kingMaker = ()=>{
      let players = [];
      for(let player in playerHandler.players){
        let tempPlayer = playerHandler.players[player]
        if(tempPlayer.state!=='quit'&&tempPlayer.state!=='incoming'&&tempPlayer.state!=='standingBy')
          players.push(tempPlayer);
      }
      playerHandler.assignPoints({playerId:   _.sample(players).playerId, points: 100});
    }
    $scope.guessRight = ()=>{
      let responses = [];
      _.each(responseHandler.responses, response=>{
        if(response.playerId!==-1&&!response.guessed)
          responses.push(response);
      });
      let response = _.sample(responses);
      let guessingPlayers = [];
      for(let player in playerHandler.players){
        if(playerHandler.players[player].checkState('guessing'))
          guessingPlayers.push(playerHandler.players[player]);
      }
      eventService.publish(gameEvents.guessReceived, {senderId: _.sample(guessingPlayers).senderId, message: {playerId:response.playerId, responseId:response.responseId}})
    }
    $scope.skipToEnd = ()=>{
      eventService.publish(gameStates.RoundEnd, "");
    }
  }]);
}
