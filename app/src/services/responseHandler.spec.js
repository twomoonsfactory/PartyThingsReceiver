'use strict'

describe('responseHandler', ()=>{
	let responseHandler, response, eventService, gameStates, $log, responseProvider, playerHandler;
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
		responseHandler = $intector.get('responseHandler', responseHandler);
		response = $intector.get('response', response);
		eventService = $intector.get('eventService', eventService);
		gameStates = $intector.get('gameStates', gameStates);
		responseProvider = $intector.get('responseProvider', responseProvider);
		$log = $intector.get('$log', $log);
		playerHandler = $intector.get('playerHandler', playerHandler);
	}));

	beforeEach(()=>{
		let rep1={response: "Burritos.", playerId: 2};
		let rep2={response: "Make out", playerId: 6};
		let rep3={response: "Tickle fights.", playerId: 7};
		spyOn(responseProvider, 'getResponse').and.callFake(()=>{return "Buffalo Wild Wings";});

		responseHandler.freshResponses();

		responseHandler.newResponse(rep1);
		responseHandler.newResponse(rep2);
		responseHandler.newResponse(rep3);

	});

	it('gets new responses', ()=>{
		expect(responseHandler.responses[0].response).toBe("Buffalo Wild Wings");
		expect(responseHandler.responses.length).toBe(4);
		expect(responseHandler.responses[3].playerId).toBe(7);
	});

	it('returns a shuffled list of the responses', ()=>{
		let result = responseHandler.getResponses();

		expect(result.length).toBe(responseHandler.responses.length);
		expect(result[result.length-1].response).toBeDefined();
		expect(result[0].responseId).toBeDefined();
	});

	it('returns the playerId of the writer', ()=>{
		let result = responseHandler.getWriter(2);

		expect(result).toBe(6);
	});

	it('adds a good guess', ()=>{
		responseHandler.goodGuess({responseId: 2, guesser: 3});
		responseHandler.goodGuess({responseId: 2, guesser: 1});

		expect(responseHandler.responses[2].correct[0]).toBe(3);
		expect(responseHandler.responses[2].correct[1]).toBe(1);
	});

	it('adds bad guesses', ()=>{
		responseHandler.badGuess({responseId: 3, guesser: 3, playerId: 0});
		responseHandler.badGuess({responseId: 3, guesser: 4, playerId: 15});

		expect(responseHandler.responses[3].incorrect[0].guesser).toBe(3);
		expect(responseHandler.responses[3].incorrect[0].guessedWriter).toBe(0);
		expect(responseHandler.responses[3].incorrect[1].guesser).toBe(4);
		expect(responseHandler.responses[3].incorrect[1].guessedWriter).toBe(15);
	});

	it('removes guessed responses, and marks the player guessed', ()=>{
		responseHandler.goodGuess({responseId: 2, guesser: 3});
		responseHandler.goodGuess({responseId: 2, guesser: 1});
		responseHandler.badGuess({responseId: 3, guesser: 3, playerId: 0});
		responseHandler.badGuess({responseId: 3, guesser: 4, playerId: 15});

		spyOn(playerHandler, 'assignPoints').and.callFake(()=>{return;});
		spyOn(playerHandler, 'playerGuessed').and.callFake(()=>{return;});

		responseHandler.resolveResponses();

		expect(responseHandler.responses.length).toBe(3);
		expect(playerHandler.playerGuessed.calls.count()).toBe(1);
	});

	it('assigns points to the correct guessers and unguessed players', ()=>{
		responseHandler.goodGuess({responseId: 2, guesser: 3});
		responseHandler.goodGuess({responseId: 2, guesser: 1});
		responseHandler.goodGuess({responseId: 2, guesser: 3, playerId: 0});
		responseHandler.badGuess({responseId: 3, guesser: 4, playerId: 15});

		spyOn(playerHandler, 'assignPoints').and.callFake(()=>{return;});
		spyOn(playerHandler, 'playerGuessed').and.callFake(()=>{return;});

		responseHandler.resolveResponses();

		expect(playerHandler.assignPoints).toHaveBeenCalledWith({playerId:3, points:3});
		expect(playerHandler.assignPoints).toHaveBeenCalledWith({playerId:7, points:5});
	});

	it('freshes the responses with one computer response', ()=>{
		responseHandler.freshResponses();

		expect(responseHandler.responses.length).toBe(1);
		expect(responseHandler.responses[0].playerId).toBe(-1);
	})
})
