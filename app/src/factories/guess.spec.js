'use strict';


describe('guessFactory', ()=>{
	let guess, rawGuesser, rawWriter, rawResponseID;

	beforeEach(angular.mock.module(require('../app.js').name));

	beforeEach(angular.mock.inject(($injector)=>{
		guess = $injector.get('guess', guess);
		//arrange for most
		rawGuesser = 'Bob';
		rawWriter = 'Joe';
		rawResponseID = 2;
	}));

	describe('constructor', ()=>{
		it('assigns values', ()=>{
			//act
			let myGuess = new guess(rawGuesser,rawWriter,rawResponseID);
			//assert
			expect(myGuess.guesser).toBe(rawGuesser);
		});
	});


	describe('prototype', ()=>{
		it('compares writers', ()=>{
			//act
			let myGuess = new guess(rawGuesser,rawWriter,rawResponseID);
			//assert
			expect(myGuess.isWriter(rawWriter)).toBe(true);
		});
	});
});
