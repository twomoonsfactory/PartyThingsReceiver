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

			player.addPoints = (points) => player.score = player.score + points;
			player.wasGuessed = () => player.guessed = true;
			player.freshRound = () => player.guessed = false;
			player.freshGame = () => {
				player.guessed = false;
				player.score = 0;
			};
			player.setState = (newState) => {
				if(_.contains(this.playerStates, newState)){
					player.state = newState;
					if(newState===this.playerStates.waiting||newState===this.playerStates.ready||newState===this.playerStates.standingBy)
						player.waitingForAction = 0;
					else if (newState===this.playerStates.quit||newState===this.playerStates.incoming)
						player.waitingForAction = -1;
					else
						player.waitingForAction = 1;
				}
				else
					this.$log.log("Player state" + newState + " is not valid.");
			};
			//takes a player state and checks if it matches the current state, returns true if true, false if false.
			player.checkState = (stateToCheck) => player.state === stateToCheck;
			return player;
		}
	}
	playerFactory.$inject = ['playerStates', '$log'];
	ngModule.service('playerFactory', playerFactory);
}
