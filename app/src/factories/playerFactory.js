export default ngModule => {
	class playerFactory {
		constructor(playerStates, $log){
				this.playerStates = playerStates;
				this.$log = $log;
		}
		newPlayer(playerName, senderId, playerId){
			let player = {};
			player.playerName = playerName;
			player.senderId = senderId;
			player.score = 0;
			player.state = ""; //playerStates.js
			player.playerId = playerId;
			player.guessed = false;
			player.waitingForAction = 0; //for ease of ngswitch -- positive means needs action. Zero does not. Negative is quit/incoming

			player.addPoints = (points) => this.score = this.score + points;
			player.wasGuessed = () => this.guessed = true;
			player.freshRound = () => this.guessed = false;
			player.freshGame = () => {
				this.guessed = false;
				this.score = 0;
			};
			player.setState = (newState) => {
				if(_.contains(this.playerStates, newState)){
					this.state = newState;
					if(newState===this.playerStates.waiting||newState===this.playerStates.ready||newState===this.playerStates.standingBy)
						this.waitingForAction = 0;
					else if (newState===this.playerStates.quit||newState===this.playerStates.incoming)
						this.waitingForAction = -1;
					else
						this.waitingForAction = 1;
				}
				else
					this.$log.log("Player state" + newState + " is not valid.");
			};
			//takes a player state and checks if it matches the current state, returns true if true, false if false.
			player.checkState = (stateToCheck) => this.state === stateToCheck;
			return player;
		}
	}
	playerFactory.$inject = ['playerStates', '$log'];
	ngModule.service('playerFactory', playerFactory);
}
