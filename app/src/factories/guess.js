export default ngModule =>{
	ngModule.factory('guess', ()=>{
		//guesser and writer are strings, responseId is an int
		let guess = (guesser, writer, responseId) => {
			this.guesser = guesser;
			this.writer = writer;
			this.responseId = responseId;
		};
		guess.prototype.isWriter = (writerToCheck) => {
			return writerToCheck === this.writer;
		};
		return guess;
	})
}
