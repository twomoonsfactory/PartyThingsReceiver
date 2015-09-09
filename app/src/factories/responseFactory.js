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

			response.addGoodGuess = (guesser) => response.correct.push(guesser);
			response.addWrongGuess = (guesser, writer) => response.incorrect.push({guesser: guesser, guessedWriter: writer});
			response.wipeGuesses = ()=>	{
				response.incorrect = [];
				response.correct = [];
			};

			return response;
		}
	}
	ngModule.service('responseFactory', responseFactory);
}
