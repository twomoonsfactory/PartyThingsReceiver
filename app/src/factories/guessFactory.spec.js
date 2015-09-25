'use strict';


describe('guessFactory', ()=>{
	let guessFactory, rawGuesser, rawWriter, rawResponseID;

	beforeEach(angular.mock.module('gameMaster');

	beforeEach(angular.mock.inject(($injector)=>{
		guess = $injector.get('guessFactory', guessFactory);
		//arrange for most
		rawGuesser = 'Bob';
		rawWriter = 'Joe';
		rawResponseID = 2;
	}));

	describe('constructor', ()=>{
		it('assigns values', ()=>{
			//act
			let myGuess = guessFactory.newGuess(rawGuesser,rawWriter,rawResponseID);
			//assert
			expect(myGuess.guesser).toBe(rawGuesser);
		});
	});


	describe('prototype', ()=>{
		it('compares writers', ()=>{
			//act
			let myGuess = guessFactory.newGuess(rawGuesser,rawWriter,rawResponseID);
			//assert
			expect(myGuess.isWriter(rawWriter)).toBe(true);
		});
	});
});
