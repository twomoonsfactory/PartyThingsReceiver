angular.module('gameMasger')
	.factory('guess', [function(){
		//guesser and writer are strings, responseId is an int
		var guess = function(guesser, writer, responseId){
			this.guesser = guesser;
			this.writer = writer;
			this.responseId = responseId;
		}
		guess.prototype.isWriter = function(writerToCheck){
			if(writerToCheck === this.writer)
				return true;
			else
				return false;
		}
		return guess;
	}]);