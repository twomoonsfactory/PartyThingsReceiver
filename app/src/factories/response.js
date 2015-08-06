export default ngModule => {
	ngModule.factory('response', ()=> {
		//constructor
		let response = (response, responseId, playerId) => {
			this.response = response;
			this.responseId = responseId;
			this.playerId = playerId;
			this.correct = [];
			this.incorrect = [];
		}

		response.prototype.addGoodGuess= (guesser) => {
			this.correct.push(guesser);
		};

		response.prototype.addWrongGuess = (guesser, writer) => {
			this.incorrect.push({guesser: guesser, guessedWriter: writer});
		};

		response.prototype.wipeGuesses = ()=>{
			this.incorrect = [];
			this.correct = [];
		};

		return response;
	})
}
