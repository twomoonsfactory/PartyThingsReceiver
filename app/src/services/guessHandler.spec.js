'use strict';
describe('guessHandler', function(){
	var guessHandler, eventService, guess, gameStates, responseHandler, args, args2;

	beforeEach(module('gameMaster'));
beforeEach(function() {
      module(function($provide) {
        $provide.constant('cast', (function(){

            var castmock = {};

            castmock.testCore = {
                receivedStrings: []
            };

            castmock.receiverManager = {                
                getCastMessageBus: function(string){
                    castmock.testCore.receivedStrings.push(string);
                    return {
                        getNamespace: function(){
                            return 'aNamespace';
                        }
                    }
                },
                start: function(status){
                            castmock.testCore.startStatus = status;
                }
            };

            castmock.receiver = {                
                logger: {
                    setLevelValue: function(levelValue){
                        castmock.testCore.levelValue = levelValue;
                    }
                },
                CastReceiverManager: {
                    getInstance: function(){
                        return castmock.receiverManager;
                    },

                }
            };
            return castmock;
        }()));
      });
     
      inject(function($window) {
        window = $window;
      });
    });
	beforeEach(inject(function(_guessHandler_,_eventService_,_guess_,_gameStates_,_responseHandler_){
		guessHandler = _guessHandler_;
		eventService = _eventService_;
		guess = _guess_;
		gameStates = _gameStates_;
		responseHandler = _responseHandler_;
		args = {guesser: 25, playerId: 13, responseId: 2};
		args2 = {guesser: 22, playerId: 15, responseId: 6};
	}));

	it('gets a new guess with the provided arguments', function(){
		guessHandler.newGuess(args);

		expect(guessHandler.guesses.length).toBe(1);
		expect(guessHandler.guesses[0].guesser).toBe(args.guesser);
		expect(guessHandler.guesses[0].writer).toBe(args.playerId);
		expect(guessHandler.guesses[0].responseId).toBe(args.responseId);		
	});

	it('checks whether guesses are correct or not', function(){
		guessHandler.newGuess(args);
		guessHandler.newGuess(args2);
		spyOn(responseHandler, 'getWriter').and.callFake(function(){return 13;});
		spyOn(responseHandler, 'goodGuess').and.callFake(function(){return;});
		spyOn(responseHandler, 'badGuess').and.callFake(function(){return;});
		spyOn(responseHandler, 'resolveResponses').and.callFake(function(){return;});

		guessHandler.tallyGuesses();

		expect(responseHandler.goodGuess.calls.count()).toBe(1);
		expect(responseHandler.badGuess.calls.count()).toBe(1);
	});

	it('wipes guesses', function(){
		guessHandler.newGuess(args);
		guessHandler.newGuess(args2);

		guessHandler.wipeGuesses();

		expect(guessHandler.guesses.length).toBe(0);
	});
});