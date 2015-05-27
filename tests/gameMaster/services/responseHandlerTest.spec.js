'use strict'

describe('responseHandler', function(){
	var responseHandler, response, eventService, gameStates, $log, responseProvider, playerHandler;
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
	beforeEach(inject(function(_responseHandler_, _response_, _eventService_, _gameStates_, _$log_, _responseProvider_, _playerHandler_){
		responseHandler = _responseHandler_;
		response = _response_;
		eventService = _eventService_;
		gameStates = _gameStates_;
		responseProvider = _responseProvider_;
		$log = _$log_;
		playerHandler = _playerHandler_;
	}));

	beforeEach(function(){
		var rep1={response: "Burritos.", playerId: 2};
		var rep2={response: "Make out", playerId: 6};
		var rep3={response: "Tickle fights.", playerId: 7};
		spyOn(responseProvider, 'getResponse').and.callFake(function(){return "Buffalo Wild Wings";});

		responseHandler.freshResponses();

		responseHandler.newResponse(rep1);
		responseHandler.newResponse(rep2);
		responseHandler.newResponse(rep3);

	});

	it('gets new responses', function(){
		expect(responseHandler.responses[0].response).toBe("Buffalo Wild Wings");
		expect(responseHandler.responses.length).toBe(4);
		expect(responseHandler.responses[3].playerId).toBe(7);
	});

	it('returns a shuffled list of the responses', function(){
		var result = responseHandler.getResponses();

		expect(result.length).toBe(responseHandler.responses.length);
		expect(result[result.length-1].response).toBeDefined();
		expect(result[0].responseId).toBeDefined();
	});

	it('returns the playerId of the writer', function(){
		var result = responseHandler.getWriter(2);

		expect(result).toBe(6);
	});

	it('adds a good guess', function(){
		responseHandler.goodGuess({responseId: 2, guesser: 3});
		responseHandler.goodGuess({responseId: 2, guesser: 1});

		expect(responseHandler.responses[2].correct[0]).toBe(3);
		expect(responseHandler.responses[2].correct[1]).toBe(1);
	});

	it('adds bad guesses', function(){
		responseHandler.badGuess({responseId: 3, guesser: 3, playerId: 0});
		responseHandler.badGuess({responseId: 3, guesser: 4, playerId: 15});

		expect(responseHandler.responses[3].incorrect[0].guesser).toBe(3);
		expect(responseHandler.responses[3].incorrect[0].guessedWriter).toBe(0);
		expect(responseHandler.responses[3].incorrect[1].guesser).toBe(4);
		expect(responseHandler.responses[3].incorrect[1].guessedWriter).toBe(15);
	});

	it('removes guessed responses, and marks the player guessed', function(){
		responseHandler.goodGuess({responseId: 2, guesser: 3});
		responseHandler.goodGuess({responseId: 2, guesser: 1});
		responseHandler.badGuess({responseId: 3, guesser: 3, playerId: 0});
		responseHandler.badGuess({responseId: 3, guesser: 4, playerId: 15});

		spyOn(playerHandler, 'assignPoints').and.callFake(function(){return;});
		spyOn(playerHandler, 'playerGuessed').and.callFake(function(){return;});

		responseHandler.resolveResponses();

		expect(responseHandler.responses.length).toBe(3);
		expect(playerHandler.playerGuessed.calls.count()).toBe(1);
	});

	it('assigns points to the correct guessers and unguessed players', function(){
		responseHandler.goodGuess({responseId: 2, guesser: 3});
		responseHandler.goodGuess({responseId: 2, guesser: 1});
		responseHandler.goodGuess({responseId: 2, guesser: 3, playerId: 0});
		responseHandler.badGuess({responseId: 3, guesser: 4, playerId: 15});

		spyOn(playerHandler, 'assignPoints').and.callFake(function(){return;});
		spyOn(playerHandler, 'playerGuessed').and.callFake(function(){return;});

		responseHandler.resolveResponses();

		expect(playerHandler.assignPoints).toHaveBeenCalledWith({playerId:3, points:3});
		expect(playerHandler.assignPoints).toHaveBeenCalledWith({playerId:7, points:5});
	});

	it('freshes the responses with one computer response', function(){
		responseHandler.freshResponses();

		expect(responseHandler.responses.length).toBe(1);
		expect(responseHandler.responses[0].playerId).toBe(-1);
	})
})