'use strict';


describe('responseFactory', function(){
	var response, rawResponse, rawResponseID, rawPlayerId, guessedBy, guessedBy2;

	beforeEach(module('gameMaster'));

	beforeEach(inject(function(_response_){
		response = _response_;
		//arrange for most
		rawResponse = 'Bob is a goof';
		rawPlayerId = 5;
		rawResponseID = 2;
		guessedBy = 3;
		guessedBy2 = 4;
	}));

	describe('constructor', function(){
		it('assigns values', function(){
			//act
			var myresponse = new response(rawResponse,rawResponseID, rawPlayerId);
			//assert
			expect(myresponse.playerId).toBe(rawPlayerId);
			expect(myresponse.response).toBe(rawResponse);
			expect(myresponse.responseId).toBe(rawResponseID);
			expect(myresponse.correct.length).toBe(0);
			expect(myresponse.incorrect.length).toBe(0);
		});
	});


	describe('prototype', function(){
		it('adds wrong guesses', function(){
			//act
			var myresponse = new response(rawResponse,rawResponseID, rawPlayerId);
			myresponse.addGoodGuess(guessedBy);
			//assert
			expect(myresponse.correct[0]).toBe(guessedBy);
		});
		it('adds correct guesses', function(){
			//act
			var myresponse = new response(rawResponse,rawResponseID, rawPlayerId);
			myresponse.addWrongGuess(guessedBy, guessedBy2);
			myresponse.addWrongGuess(guessedBy2, guessedBy);
			//assert
			expect(myresponse.incorrect[0].guesser).toEqual(guessedBy);
			expect(myresponse.incorrect[0].guessedWriter).toEqual(guessedBy2);
			expect(myresponse.incorrect[1].guesser).toEqual(guessedBy2);
			expect(myresponse.incorrect[1].guessedWriter).toEqual(guessedBy);
		});
	});
});
