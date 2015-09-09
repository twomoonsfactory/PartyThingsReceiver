export default ngModule =>{
	class guessFactory{
		constructor(){
		}
		//guesser and writer are strings, responseId is an int
		newGuess(guesser, writer, responseId){
			let guess = {};

			guess.guesser = guesser;
			guess.writer = writer;
			guess.responseId = responseId;
			guess.isWriter = writerToCheck => writerToCheck === guess.writer;

			return guess;
		}

	}
	ngModule.service('guessFactory', guessFactory);
}
