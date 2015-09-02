export default ngModule => {
	class responseFactory{
		constructor(){
		}
		newResponse(newResponse, responseId, playerId){
			let response = {};
			response.response = newResponse;
			response.responseId = responseId;
			response.playerId = playerId;
			response.correct = [];
			response.incorrect = [];

			response.addGoodGuess = (guesser) => this.correct.push(guesser);
			response.addWrongGuess = (guesser, writer) => this.incorrect.push({guesser: guesser, guessedWriter: writer});
			response.wipeGuesses = ()=>	{
				this.incorrect = [];
				this.correct = [];
			};

			return response;
		}
	}
	ngModule.service('responseFactory', responseFactory);
}
