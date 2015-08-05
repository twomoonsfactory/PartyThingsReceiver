module.exports = function(){
		//constructor
		var response = function(response, responseId, playerId){
			this.response = response;
			this.responseId = responseId;
			this.playerId = playerId;
			this.correct = [];
			this.incorrect = [];
		}

		response.prototype.addGoodGuess= function(guesser){
			this.correct.push(guesser);
		};

		response.prototype.addWrongGuess = function(guesser, writer){
			this.incorrect.push({guesser: guesser, guessedWriter: writer});
		};

		response.prototype.wipeGuesses = function(){
			this.incorrect = [];
			this.correct = [];
		};

		return response;
	};
