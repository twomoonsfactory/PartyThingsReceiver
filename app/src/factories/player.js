export default class player {
	constructor(playerName, senderId, playerId, playerStates, $log){
		this.playerName = playerName;
		this.senderId = senderId;
		this.score = 0;
		this.state = ""; //playerStates.js
		this.playerId = playerId;
		this.guessed = false;
		this.waitingForAction = 0; //for ease of ngswitch -- positive means needs action. Zero does not. Negative is quit/incoming

		this.log = $log;
		this.playerStates = playerStates;

		return this;
	}

	addPoints(points){
		this.score = this.score + points;
	}

	wasGuessed(){
		this.guessed = true;
	}

	freshRound(){
		this.guessed = false;
	}

	freshGame(){
		this.guessed = false;
		this.score = 0;
	}

	setState(newState){
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
			this.log.log("Player state" + newState + " is not valid.");
	}

	//takes a player state and checks if it matches the current state, returns true if true, false if false.
	checkState(stateToCheck){
		return this.state === stateToCheck;
	}
}
player.$inject = ['playerStates', '$log'];
