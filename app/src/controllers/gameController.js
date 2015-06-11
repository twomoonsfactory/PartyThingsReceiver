module.exports = function($scope, $log, $location) {
	     	$scope.message = "Foo";
	      	$scope.gamename = "Foo";
	      	$scope.players = [];
	      	$scope.things = [];
	      	$scope.infoDisplay = null;
	      	$scope.prompts;
	      	$scope.changeView = function(view){
	      		$location.path(view);
	      	}
	      	$scope.nameGame = function(args){
	      		$scope.gamename = args.message.gamename;
	      	}
	      	//eventService.subscribe(gameEvents.gamenameReceived, $scope.nameGame);
	      	// $scope.nameIt = function(){
	      	// 	eventService.publish(gameEvents.gamenameReceived, {message:{gamename: "Hell's Kitchen"}});
	      	// }
  	};
