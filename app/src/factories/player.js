angular.module('gameMaster')
	//establishes the player object
	.factory('player', ['playerStates', '$log', function(playerStates, $log){
		var player = function(playerName, senderId, playerId){
			this.playerName = playerName;
			this.senderId = senderId;
			this.score = 0;
			this.state = ""; //playerStates.js
			this.playerId = playerId;
			this.guessed = false;
		}

		player.prototype.addPoints = function(points){
			this.score = this.score + points;
		};

		player.prototype.wasGuessed = function(){
			this.guessed = true;
		};

		player.prototype.freshRound = function(){
			this.guessed = false;
		};

		player.prototype.freshGame = function(){
			this.guessed = false;
			this.score = 0;
		};

		player.prototype.setState = function(newState){
			if(_.contains(playerStates, newState))
				this.state = newState;
			else
				$log.log("Player state" + newState + " is not valid.");
		};

		//takes a player state and checks if it matches the current state, returns true if true, false if false.
		player.prototype.checkState = function(stateToCheck){
			return this.state === stateToCheck;
		};

		return player;
	}]);