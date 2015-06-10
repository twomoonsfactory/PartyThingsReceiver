angular.module('gameMaster')
	.factory('guess', [function(){
		//guesser and writer are strings, responseId is an int
		var guess = function(guesser, writer, responseId){
			this.guesser = guesser;
			this.writer = writer;
			this.responseId = responseId;
		};
		guess.prototype.isWriter = function(writerToCheck){
			return writerToCheck === this.writer;
		};
		return guess;
	}]);