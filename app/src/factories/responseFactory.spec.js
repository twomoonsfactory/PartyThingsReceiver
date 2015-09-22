'use strict';


describe('responseFactory', ()=>{
	let responseFactory, rawResponse, rawResponseID, rawPlayerId, guessedBy, guessedBy2;

	beforeEach(angular.mock.module(require('../app.js').name));

	beforeEach(angular.mock.inject(($injector)=>{
		responseFactory = $injector.get('responseFactory', responseFactory);
		//arrange for most
		rawResponse = 'Bob is a goof';
		rawPlayerId = 5;
		rawResponseID = 2;
		guessedBy = 3;
		guessedBy2 = 4;
	}));

	describe('constructor', ()=>{
		it('assigns values', ()=>{
			//act
			let myresponse = responseFactory.newResponse(rawResponse,rawResponseID, rawPlayerId);
			//assert
			expect(myresponse.playerId).toBe(rawPlayerId);
			expect(myresponse.response).toBe(rawResponse);
			expect(myresponse.responseId).toBe(rawResponseID);
			expect(myresponse.correct.length).toBe(0);
			expect(myresponse.incorrect.length).toBe(0);
		});
	});


	describe('prototype', ()=>{
		it('adds wrong guesses', ()=>{
			//act
			let myresponse = responseFactory.newResponse(rawResponse,rawResponseID, rawPlayerId);
			myresponse.addGoodGuess(guessedBy);
			//assert
			expect(myresponse.correct[0]).toBe(guessedBy);
		});
		it('adds correct guesses', ()=>{
			//act
			let myresponse = responseFactory.newResponse(rawResponse,rawResponseID, rawPlayerId);
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
