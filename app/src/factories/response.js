export default class response{
	construtor(response, responseId, playerId){
		this.response = response;
		this.responseId = responseId;
		this.playerId = playerId;
		this.correct = [];
		this.incorrect = [];

		return this;
	}

	addGoodGuess(guesser){
		this.correct.push(guesser);
	}

	addWrongGuess(guesser, writer){
		this.incorrect.push({guesser: guesser, guessedWriter: writer});
	}

	wipeGuesses(){
		this.incorrect = [];
		this.correct = [];
	}
}
