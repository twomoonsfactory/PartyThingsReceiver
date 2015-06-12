module.exports = function($scope, $log, $location, eventService, gameEvents, player) {
 	$scope.message = "Foo";
  	$scope.gamename = "Foo";
  	$scope.players = [
  		{
  			playerName: "Joe",
  			senderId: 123,
  			score: 5,
  			state: "writing",
  			playerId: 1,
  			guessed: false
  		},
  		{
  			playerName: "Bob",
  			senderId: 135,
  			score: 10,
  			state: "ready",
  			playerId: 2,
  			guessed: false
  		},
  		{
  			playerName: "Samantha",
  			senderId: 52412,
  			score: 33,
  			state: "writing",
  			playerId: 3,
  			guessed: false
  		}
		];
  	$scope.things = [];
  	$scope.infoDisplay = null;
  	$scope.prompts;
  	$scope.owner = "the";
  	var incoming = {playerName: "Incoming Player", score: 0};
  	$scope.changeView = function(view){
  		$location.path(view);
  	}
  	$scope.nameGame = function(args){
  		$scope.gamename = args;
  	}
  	eventService.subscribe(gameEvents.gameNamed, $scope.nameGame);
  	$scope.addOwner = function(args){
  		$scope.owner = args.message.playerName + '\'s';
  	}
  	eventService.subscribe(gameEvents.gamenameReceived, $scope.addOwner);
  	$scope.nameIt = function(){
  		eventService.publish(gameEvents.gameNamed, "IT WORKS");
  		eventService.publish(gameEvents.gamenameReceived, {message:{playerName: "Chuck"}});
  	}
  	//adds "pending player"
  	$scope.pendPlayer = function(){
  		if(!_.contains($scope.players, incoming))
  			$scope.players.push(incoming);
  	}
  	//adds a new player to the display
  	$scope.addPlayer = function(player){
  		if(_.contains($scope.players, incoming))
  			$scope.players.splice(_.indexOf($scope.players, incoming), 1);
  		$scope.players.push(player);
  	};
  	//drops a player from the display
  	$scope.dropPlayer = function(player){
  		$scope.players.splice(_.indexOf($scope.players, player), 1);
  	};

    $scope.morePoints = function(){
          $scope.players[3].addPoints(5);
    }

    this.newPlayer = function(args){
          $scope.addPlayer(new player(args.message.playerName, 1512, 5));
    }
    eventService.subscribe(gameEvents.playernameReceived, this.newPlayer);

    $scope.plusPlayer = function(){
          eventService.publish(gameEvents.playernameReceived, {message:{playerName: "Franklin"}});
    }
      	//highlight a player with pending action

      	//remove highlight

      	//sort players by score
};
