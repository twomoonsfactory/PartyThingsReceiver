module.exports = function(playerStates, $log){
		var player = function(playerName, senderId, playerId){
			this.playerName = playerName;
			this.senderId = senderId;
			this.score = 0;
			this.state = ""; //playerStates.js
			this.playerId = playerId;
			this.guessed = false;
			this.waitingForAction = 0; //for ease of ngswitch -- positive means needs action. Zero does not. Negative is quit/incoming
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
			if(_.contains(playerStates, newState)){
				this.state = newState;
				if(newState===playerStates.waiting||newState===playerStates.ready||newState===playerStates.standingBy)
					this.waitingForAction = 0;
				else if (newState===playerStates.quit||newState===playerStates.incoming)
					this.waitingForAction = -1;
				else
					this.waitingForAction = 1;
			}
			else
				$log.log("Player state" + newState + " is not valid.");
		};

		//takes a player state and checks if it matches the current state, returns true if true, false if false.
		player.prototype.checkState = function(stateToCheck){
			return this.state === stateToCheck;
		};

		return player;
	};
