'use strict';
describe('guessHandler', ()=>{
	let guessHandler, eventService, guess, gameStates, responseHandler, args, args2;

	beforeEach(angular.mock.module(require('../app.js').name));
	beforeEach(function() {
      angular.mock.module(function($provide) {
        $provide.constant('cast', (()=>{

            let castmock = {};

            castmock.testCore = {
                receivedStrings: []
            };

            castmock.receiverManager = {
                getCastMessageBus: function(string){
                    castmock.testCore.receivedStrings.push(string);
                    return {
                        getNamespace: ()=>{
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
                    getInstance: ()=>{
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

	beforeEach(angular.mock.inject(($injector)=>{
		guessHandler = $injector.get('guessHandler', guessHandler);
		eventService = $injector.get('eventService', eventService);
		guess = $injector.get('guess', guess);
		gameStates = $injector.get('gameStates', gameStates);
		responseHandler = $injector.get('responseHandler', responseHandler);
		args = {guesser: 25, playerId: 13, responseId: 2};
		args2 = {guesser: 22, playerId: 15, responseId: 6};
	}));

	it('gets a new guess with the provided arguments', ()=>{
		guessHandler.newGuess(args);

		expect(guessHandler.guesses.length).toBe(1);
		expect(guessHandler.guesses[0].guesser).toBe(args.guesser);
		expect(guessHandler.guesses[0].writer).toBe(args.playerId);
		expect(guessHandler.guesses[0].responseId).toBe(args.responseId);
	});

	it('checks whether guesses are correct or not', ()=>{
		guessHandler.newGuess(args);
		guessHandler.newGuess(args2);
		spyOn(responseHandler, 'getWriter').and.callFake(()=>{return 13;});
		spyOn(responseHandler, 'goodGuess').and.callFake(()=>{return;});
		spyOn(responseHandler, 'badGuess').and.callFake(()=>{return;});
		spyOn(responseHandler, 'resolveResponses').and.callFake(()=>{return;});

		guessHandler.tallyGuesses();

		expect(responseHandler.goodGuess.calls.count()).toBe(1);
		expect(responseHandler.badGuess.calls.count()).toBe(1);
	});

	it('wipes guesses', ()=>{
		guessHandler.newGuess(args);
		guessHandler.newGuess(args2);

		guessHandler.wipeGuesses();

		expect(guessHandler.guesses.length).toBe(0);
	});
});
