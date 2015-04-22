angular.module('gameMaster.factories', [])
	//establishes the player object
	.factory('player', function(){
		//constructor
		function player(playerName, senderId){
			this.playerName = playerName;
			this.senderId = senderId;
			this.score = 0;
			this.state = "";
			this.playerId = 0;
			this.guessed = false;
		}

		player.build = function(args){
			return new player(
				args.playerName,
				args.senderId
			);
		}
	});