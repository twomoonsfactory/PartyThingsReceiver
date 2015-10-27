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
			response.guesses = 0;
			response.guessed = false;

			response.addGoodGuess = (guesser, writer) => {
				response.correct.push({guesser: guesser, guessedWriter: writer});
				response.guesses ++;
				response.guessed = true;
			}
			response.addWrongGuess = (guesser, writer) => {
				response.incorrect.push({guesser: guesser, guessedWriter: writer});
				response.guesses ++;
			}
			response.wipeGuesses = ()=>	{
				response.incorrect = [];
				response.correct = [];
				response.guesses = 0;
			};

			return response;
		}
	}
	ngModule.service('responseFactory', responseFactory);
}
