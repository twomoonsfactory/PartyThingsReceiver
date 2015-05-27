'use strict'
describe('gameDriver', function(){
	var gameDriver, eventService, gameEvents, stateManager, gameStates, messageSender, messageProvider, messageNames, playerHandler, playerStates, responseHandler, guessHandler, $log;
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

	beforeEach(inject(function(_gameDriver_, _eventService_, _gameEvents_, _stateManager_, _gameStates_, _messageSender_, _messageProvider_, _messageNames_, _playerHandler_, _playerStates_, _responseHandler_, _guessHandler_, _$log_){
		gameDriver = _gameDriver_;
		eventService = _eventService_;
		messageSender = _messageSender_;
		messageProvider = _messageProvider_;
		messageNames = _messageNames_;
		playerHandler = _playerHandler_;
		playerStates = _playerStates_;
		responseHandler = _responseHandler_;
		stateManager = _stateManager_;
		gameStates = _gameStates_;
		guessHandler = _guessHandler_;
		$log = _$log_;

		spyOn(messageSender, 'requestReady').and.callFake(function(){return;});
		spyOn(messageSender, 'requestPlayerName').and.callFake(function(){return;});
		spyOn(messageProvider, 'getMessage').and.callFake(function(){return "message";});
		spyOn(messageSender, 'requestPrompt').and.callFake(function(){return;});
		spyOn(messageSender, 'requestResponse').and.callFake(function(){return;});
		spyOn(messageSender, 'requestGuess').and.callFake(function(){return;});
		spyOn(messageSender, 'sendEnd').and.callFake(function(){return;});
	}));

	beforeEach(function(){

		stateManager.setState(gameStates.WaitingForStart);
		playerHandler.playerNamed({message:{playerName:'bob'}, senderId:123});
		playerHandler.playerNamed({message:{playerName:'jan'}, senderId:456});
		playerHandler.playerNamed({message:{playerName:'joe'}, senderId:789});
		playerHandler.playerNamed({message:{playerName:'nat'}, senderId:987});
	});

	it('requests players to get ready', function(){
		playerHandler.players[0].state = playerStates.quit;
		playerHandler.players[1].state = playerStates.readyRequested;
		playerHandler.players[2].state = playerStates.waiting;
		playerHandler.players[3].state = playerStates.waiting;

		gameDriver.readyUp();

		expect(messageSender.requestReady.calls.count()).toBe(2);
		expect(playerHandler.players[0].state).not.toBe(playerStates.readyRequested);
		expect(playerHandler.players[2].state).toBe(playerStates.readyRequested);

	});

	it('sets players as ready', function(){
		playerHandler.activePlayers = 10;
		gameDriver.playerReady({senderId:123});
		gameDriver.playerReady({senderId:789});

		expect(playerHandler.players[0].state).toBe(playerStates.ready);
		expect(playerHandler.players[2].state).toBe(playerStates.ready);
	});

	it('continues when all players are ready', function(){
		playerHandler.activePlayers = 2;
		spyOn(stateManager, 'setState').and.callFake(function(){return;});
		gameDriver.playerReady({senderId:123});
		gameDriver.playerReady({senderId:789});

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.ReadyToStart);
	});

	it('sends prompts to ready players', function(){
		_.each(playerHandler.players, function(player){player.setState(playerStates.ready)});
		playerHandler.players[2].setState(playerStates.standingBy);

		gameDriver.sendPrompts();

		expect(messageSender.requestPrompt.calls.count()).toBe(3);
		expect(playerHandler.players[3].state).toBe(playerStates.voting);
	});

	it('accepts player votes', function(){
		playerHandler.activePlayers = 10;
		gameDriver.voteReceived({senderId:456, message:{promptIndex:2}});
		gameDriver.voteReceived({senderId:987, message:{promptIndex:3}});

		expect(messageSender.requestPrompt.calls.count()).toBe(2);
		expect(playerHandler.players[1].state).toBe(playerStates.ready);
		expect(playerHandler.players[3].state).toBe(playerStates.ready);
	});

	it('moves to next state after all votes received', function(){
		playerHandler.activePlayers = 2;
		spyOn(stateManager, 'setState').and.callFake(function(){return;});
		
		gameDriver.voteReceived({senderId:456, message:{promptIndex:2}});
		gameDriver.voteReceived({senderId:987, message:{promptIndex:3}});

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.PromptChosen);
	});

	it('requests responses from all ready players', function(){
		_.each(playerHandler.players, function(player){player.setState(playerStates.ready)});
		playerHandler.players[3].setState(playerStates.standingBy);

		gameDriver.requestResponse();

		expect(messageSender.requestResponse.calls.count()).toBe(3);
		expect(playerHandler.players[0].state).toBe(playerStates.writing);
	});

	it('accepts player responses', function(){
		playerHandler.activePlayers = 10;
		spyOn(responseHandler, 'newResponse').and.callFake(function(){return;});

		gameDriver.receivedResponse({senderId:123, message:{response:'foo'}});
		gameDriver.receivedResponse({senderId:987, message:{response:'bar'}});
		
		expect(playerHandler.players[0].state).toBe(playerStates.ready);
		expect(playerHandler.players[3].state).toBe(playerStates.ready);
		expect(responseHandler.newResponse.calls.count()).toBe(2);
	});

	it('continues after receiving all responses', function(){
		playerHandler.activePlayers = 2;
		spyOn(stateManager, 'setState').and.callFake(function(){return;});

		gameDriver.receivedResponse({senderId:123, message:{response:'foo'}});
		gameDriver.receivedResponse({senderId:987, message:{response:'bar'}});

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.ResponsesReceived);
	});

	it('sends guess info', function(){
		_.each(playerHandler.players, function(player){player.setState(playerStates.ready)});
		playerHandler.players[2].setState(playerStates.standingBy);

		gameDriver.startGuessing();

		expect(messageSender.requestGuess.calls.count()).toBe(3);
		expect(playerHandler.players[3].state).toBe(playerStates.guessing);
	});

	it('receives guesses', function(){
		playerHandler.activePlayers = 10;
		spyOn(guessHandler, 'newGuess').and.callFake(function(){return;});
		responseHandler.newResponse({response: 'fake', playerId: -1});
		responseHandler.newResponse({response: 'Foo', playerId:2});
		responseHandler.newResponse({response: 'Bar', playerId: 5});

		gameDriver.guessReceiver({senderId:123, message:{playerId:1, responseId:1}});
		gameDriver.guessReceiver({senderId:987, message:{playerId:2, responseId:2}});
		
		expect(playerHandler.players[0].state).toBe(playerStates.ready);
		expect(playerHandler.players[3].state).toBe(playerStates.ready);
		expect(guessHandler.newGuess.calls.count()).toBe(2);
	});

	it('tallies guesses after all guesses are received', function(){
		playerHandler.activePlayers = 2;
		spyOn(guessHandler, 'tallyGuesses').and.callFake(function(){return;});
		spyOn(playerHandler, 'unguessedPlayers').and.callFake(function(){return false;});
		responseHandler.newResponse({response: 'fake', playerId: -1});
		responseHandler.newResponse({response: 'Foo', playerId:2});
		responseHandler.newResponse({response: 'Bar', playerId: 5});
		spyOn(stateManager, 'setState').and.callFake(function(){return;});

		gameDriver.guessReceiver({senderId:123, message:{playerId:1, responseId:1}});
		gameDriver.guessReceiver({senderId:987, message:{playerId:2, responseId:2}});

		expect(guessHandler.tallyGuesses).toHaveBeenCalled();
	});

	it('continues after all players are guessed', function(){
		playerHandler.activePlayers = 2;
		spyOn(playerHandler, 'unguessedPlayers').and.callFake(function(){return false;});
		spyOn(guessHandler, 'tallyGuesses').and.callFake(function(){return;});
		responseHandler.newResponse({response: 'fake', playerId: -1});
		responseHandler.newResponse({response: 'Foo', playerId:2});
		responseHandler.newResponse({response: 'Bar', playerId: 5});
		spyOn(stateManager, 'setState').and.callFake(function(){return;});

		gameDriver.guessReceiver({senderId:123, message:{playerId:1, responseId:1}});
		gameDriver.guessReceiver({senderId:987, message:{playerId:2, responseId:2}});

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.RoundEnd);
	});

	it('loops back through if some players remain unguessed', function(){
		playerHandler.activePlayers = 2;
		spyOn(playerHandler, 'unguessedPlayers').and.callFake(function(){return true;});
		spyOn(guessHandler, 'tallyGuesses').and.callFake(function(){return;});
		responseHandler.newResponse({response: 'fake', playerId: -1});
		responseHandler.newResponse({response: 'Foo', playerId:2});
		responseHandler.newResponse({response: 'Bar', playerId: 5});
		spyOn(responseHandler, 'getResponses').and.callFake(function(){return [];});

		gameDriver.guessReceiver({senderId:123, message:{playerId:1, responseId:1}});
		gameDriver.guessReceiver({senderId:987, message:{playerId:2, responseId:2}});	

		//4 calls mean that the two guesses were confirmed, and then that both players were sent the remaining responses as well.
		expect(messageSender.requestGuess.calls.count()).toBe(4);
	});

	it('kicks off another round if the high score was not reached', function(){
		spyOn(playerHandler, 'highScore').and.callFake(function(){return 5;});
		spyOn(stateManager, 'setState').and.callFake(function(){return;});
		playerHandler.players[0].setState(playerStates.standingBy);
		playerHandler.players[1].setState(playerStates.quit);


		gameDriver.nextRound();

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.ReadyToStart);
		expect(playerHandler.players[0].state).toBe(playerStates.ready);
		expect(playerHandler.players[1].state).toBe(playerStates.quit);
	});

	it('ends the game if the high score was reached', function(){
		spyOn(playerHandler, 'highScore').and.callFake(function(){return 55;});
		spyOn(stateManager, 'setState').and.callFake(function(){return;});

		gameDriver.nextRound();

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.GameEnd);
	});

	it('invites players to play again for endGame', function(){
		playerHandler.players[0].setState(playerStates.ready);
		playerHandler.players[1].setState(playerStates.ready);
		playerHandler.players[2].setState(playerStates.ready);
		playerHandler.players[3].setState(playerStates.ready);
		playerHandler.players[0].score = 25;
		spyOn(playerHandler, 'highScore').and.callFake(function(){return 25;});
		spyOn(stateManager, 'setState').and.callFake(function(){return;});

		gameDriver.endGame();

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.WaitingForReady);
		expect(messageSender.sendEnd.calls.count()).toBe(4);
	});

	it('sends the winner congratulations', function(){
		playerHandler.players[0].setState(playerStates.ready);
		playerHandler.players[1].setState(playerStates.ready);
		playerHandler.players[2].setState(playerStates.ready);
		playerHandler.players[3].setState(playerStates.ready);
		playerHandler.players[0].score = 25;
		playerHandler.players[2].score = 25;
		spyOn(playerHandler, 'highScore').and.callFake(function(){return 25;});
		spyOn(stateManager, 'setState').and.callFake(function(){return;});

		gameDriver.endGame();

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.WaitingForReady);
		expect(messageSender.sendEnd).toHaveBeenCalledWith({senderId: 123, message: 'messagemessage'});
		expect(messageSender.sendEnd).toHaveBeenCalledWith({senderId: 789, message: 'messagemessage'});
	});
});