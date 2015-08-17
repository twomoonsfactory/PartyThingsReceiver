export default class guess{
	//guesser and writer are strings, responseId is an int
	constructor(guesser, writer, responseId){
		this.guesser = guesser;
		this.writer = writer;
		this.responseId = responseId;
		return this;
	}
	isWriter(writerToCheck){
		return writerToCheck === this.writer;
	}
}
