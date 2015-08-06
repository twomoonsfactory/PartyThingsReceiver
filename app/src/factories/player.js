export default ngModule => {
	ngModule.factory('player', ['playerStates', '$log', (playerStates, $log) => {
		let player = (playerName, senderId, playerId) => {
			this.playerName = playerName;
			this.senderId = senderId;
			this.score = 0;
			this.state = ""; //playerStates.js
			this.playerId = playerId;
			this.guessed = false;
			this.waitingForAction = 0; //for ease of ngswitch -- positive means needs action. Zero does not. Negative is quit/incoming
		}

		player.prototype.addPoints = (points) => {
			this.score = this.score + points;
		};

		player.prototype.wasGuessed = () => {
			this.guessed = true;
		};

		player.prototype.freshRound = () => {
			this.guessed = false;
		};

		player.prototype.freshGame = () => {
			this.guessed = false;
			this.score = 0;
		};

		player.prototype.setState = (newState) => {
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
		player.prototype.checkState = (stateToCheck) => {
			return this.state === stateToCheck;
		};

		return player;
	}])
}
