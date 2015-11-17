export default ngModule => {
	class playerFactory {
		constructor(playerStates, $log){
				this.playerStates = playerStates;
				this.$log = $log;
		}
		newPlayer(senderId, playerId){
			let player = {};
			player.playerName = "Incoming...";
			player.senderId = senderId;
			player.score = 0;
			player.scoreToAdd = 0;
			player.state = this.playerStates.incoming; //playerStates.js
			player.playerId = playerId;
			player.guessed = false;
			player.standingBy = false;
			player.written = false;
			player.waitingForAction = -1; //for ease of ngswitch -- positive means needs action. Zero does not. Negative is quit/incoming

			player.namePlayer = (name) => {
				player.playerName = name;
				player.waitingForAction = 0;
			}
			player.addPoints = (points) => player.score = player.score + points;
			player.addScore = (score) => player.scoreToAdd = score;
			player.wasGuessed = () => player.guessed = true;
			player.freshRound = () => {
				player.guessed = false;
				player.written = false;
			}
			player.freshGame = () => {
				player.freshRound();
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
					if(newState===this.playerStates.standingBy)player.standingBy = true;
					else {
						player.standingBy = false;
					}
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
