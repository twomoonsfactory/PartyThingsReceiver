'use strict';


describe('guessFactory', function(){
	var guess, rawGuesser, rawWriter, rawResponseID;

	beforeEach(module('gameMaster'));

	beforeEach(inject(function(_guess_){
		guess = _guess_;
		//arrange for most
		rawGuesser = 'Bob';
		rawWriter = 'Joe';
		rawResponseID = 2;
	}));

	describe('constructor', function(){
		it('assigns values', function(){
			//act
			var myGuess = new guess(rawGuesser,rawWriter,rawResponseID);
			//assert
			expect(myGuess.guesser).toBe(rawGuesser);
		});
	});


	describe('prototype', function(){
		it('compares writers', function(){
			//act
			var myGuess = new guess(rawGuesser,rawWriter,rawResponseID);
			//assert
			expect(myGuess.isWriter(rawWriter)).toBe(true);
		});
	});
});
