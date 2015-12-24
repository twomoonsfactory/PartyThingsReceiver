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
			player.written = false;
			player.incoming = true;
			player.standingBy = false;
			player.needsAction = false;
			player.writing = false;
			player.ready = false;
			player.quit = false;

			player.namePlayer = (name) => {
				player.playerName = name;
				player.incoming = false;
				player.ready = true;
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
					player.standingBy = false;
					player.needsAction = false;
					player.ready = false;
					player.quit = false;
					player.writing = false;
					player.state = newState;

					switch(newState){
						case this.playerStates.waiting||this.playerStates.ready:
							player.ready = true;
						break;
						case this.playerStates.standingBy:
							player.standingBy = true;
						break;
						case this.playerStates.quit:
							player.quit = true;
						break;
						case this.playerStates.writing:
							player.writing = true;
						break;
						default:
							player.needsAction = true;
						break;
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
