'use strict'
describe('gameDriver', ()=>{
	let gameDriver, eventService, gameEvents, stateManager, gameStates, messageSender, messageProvider, messageNames, playerHandler, playerStates, responseHandler, guessHandler, $log;
	beforeEach(angular.mock.module('gameMaster');
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
		gameDriver = $injector.get('gameDriver', gameDriver);
		eventService = $injector.get('eventService', eventService);
		messageSender = $injector.get('messageSender', messageSender);
		messageProvider = $injector.get('messageProvider', messageProvider)
		messageNames = $injector.get('messageNames', messageNames);
		playerHandler = $injector.get('playerHandler', playerHandler);
		playerStates = $injector.get('playerStates', playerStates);
		responseHandler = $injector.get('responseHandler', responseHandler);
		stateManager = $injector.get('stateManager', stateManager);
		gameStates = $injector.get('gameStates', gameStates);
		guessHandler = $injector.get('guessHandler', guessHandler);
		gameEvents = $injector.get('gameEvents', gameEvents);

		spyOn(messageSender, 'requestReady').and.callFake(()=>{return;});
		spyOn(messageSender, 'requestPlayerName').and.callFake(()=>{return;});
		spyOn(messageProvider, 'getMessage').and.callFake(()=>{return "message";});
		spyOn(messageSender, 'requestPrompt').and.callFake(()=>{return;});
		spyOn(messageSender, 'requestResponse').and.callFake(()=>{return;});
		spyOn(messageSender, 'requestGuess').and.callFake(()=>{return;});
		spyOn(messageSender, 'sendEnd').and.callFake(()=>{return;});
	}));

	beforeEach(()=>{

		stateManager.setState(gameStates.WaitingForStart);
		playerHandler.playerNamed({message:{playerName:'bob'}, senderId:123});
		playerHandler.playerNamed({message:{playerName:'jan'}, senderId:456});
		playerHandler.playerNamed({message:{playerName:'joe'}, senderId:789});
		playerHandler.playerNamed({message:{playerName:'nat'}, senderId:987});
	});

	it('requests players to get ready', ()=>{
		playerHandler.players[0].state = playerStates.quit;
		playerHandler.players[1].state = playerStates.readyRequested;
		playerHandler.players[2].state = playerStates.waiting;
		playerHandler.players[3].state = playerStates.waiting;

		gameDriver.readyUp();

		expect(messageSender.requestReady.calls.count()).toBe(2);
		expect(playerHandler.players[0].state).not.toBe(playerStates.readyRequested);
		expect(playerHandler.players[2].state).toBe(playerStates.readyRequested);

	});

	it('sets players as ready', ()=>{
		playerHandler.activePlayers = 10;
		gameDriver.playerReady({senderId:123});
		gameDriver.playerReady({senderId:789});

		expect(playerHandler.players[0].state).toBe(playerStates.ready);
		expect(playerHandler.players[2].state).toBe(playerStates.ready);
	});

	it('continues when all players are ready', ()=>{
		playerHandler.activePlayers = 2;
		spyOn(stateManager, 'setState').and.callFake(()=>{return;});
		gameDriver.playerReady({senderId:123});
		gameDriver.playerReady({senderId:789});

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.ReadyToStart);
	});

	it('sends prompts to ready players', ()=>{
		_.each(playerHandler.players, function(player){player.setState(playerStates.ready)});
		playerHandler.players[2].setState(playerStates.standingBy);

		gameDriver.sendPrompts();

		expect(messageSender.requestPrompt.calls.count()).toBe(3);
		expect(playerHandler.players[3].state).toBe(playerStates.voting);
	});

	it('accepts player votes', ()=>{
		playerHandler.activePlayers = 10;
		gameDriver.voteReceived({senderId:456, message:{promptIndex:2}});
		gameDriver.voteReceived({senderId:987, message:{promptIndex:3}});

		expect(messageSender.requestPrompt.calls.count()).toBe(2);
		expect(playerHandler.players[1].state).toBe(playerStates.ready);
		expect(playerHandler.players[3].state).toBe(playerStates.ready);
	});

	it('moves to next state after all votes received', ()=>{
		playerHandler.activePlayers = 2;
		spyOn(stateManager, 'setState').and.callFake(()=>{return;});

		gameDriver.voteReceived({senderId:456, message:{promptIndex:2}});
		gameDriver.voteReceived({senderId:987, message:{promptIndex:3}});

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.PromptChosen);
	});

	it('requests responses from all ready players', ()=>{
		_.each(playerHandler.players, function(player){player.setState(playerStates.ready)});
		playerHandler.players[3].setState(playerStates.standingBy);

		gameDriver.requestResponse();

		expect(messageSender.requestResponse.calls.count()).toBe(3);
		expect(playerHandler.players[0].state).toBe(playerStates.writing);
	});

	it('accepts player responses', ()=>{
		playerHandler.activePlayers = 10;
		spyOn(responseHandler, 'newResponse').and.callFake(()=>{return;});

		gameDriver.receivedResponse({senderId:123, message:{response:'foo'}});
		gameDriver.receivedResponse({senderId:987, message:{response:'bar'}});

		expect(playerHandler.players[0].state).toBe(playerStates.ready);
		expect(playerHandler.players[3].state).toBe(playerStates.ready);
		expect(responseHandler.newResponse.calls.count()).toBe(2);
	});

	it('continues after receiving all responses', ()=>{
		playerHandler.activePlayers = 2;
		spyOn(stateManager, 'setState').and.callFake(()=>{return;});

		gameDriver.receivedResponse({senderId:123, message:{response:'foo'}});
		gameDriver.receivedResponse({senderId:987, message:{response:'bar'}});

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.ResponsesReceived);
	});

	it('sends guess info', ()=>{
		_.each(playerHandler.players, function(player){player.setState(playerStates.ready)});
		playerHandler.players[2].setState(playerStates.standingBy);

		gameDriver.startGuessing();

		expect(messageSender.requestGuess.calls.count()).toBe(3);
		expect(playerHandler.players[3].state).toBe(playerStates.guessing);
	});

	it('receives guesses', ()=>{
		playerHandler.activePlayers = 10;
		spyOn(guessHandler, 'newGuess').and.callFake(()=>{return;});
		responseHandler.newResponse({response: 'fake', playerId: -1});
		responseHandler.newResponse({response: 'Foo', playerId:2});
		responseHandler.newResponse({response: 'Bar', playerId: 5});

		gameDriver.guessReceiver({senderId:123, message:{playerId:1, responseId:1}});
		gameDriver.guessReceiver({senderId:987, message:{playerId:2, responseId:2}});

		expect(playerHandler.players[0].state).toBe(playerStates.ready);
		expect(playerHandler.players[3].state).toBe(playerStates.ready);
		expect(guessHandler.newGuess.calls.count()).toBe(2);
	});

	it('tallies guesses after all guesses are received', ()=>{
		playerHandler.activePlayers = 2;
		spyOn(guessHandler, 'tallyGuesses').and.callFake(()=>{return;});
		spyOn(playerHandler, 'unguessedPlayers').and.callFake(()=>{return false;});
		responseHandler.newResponse({response: 'fake', playerId: -1});
		responseHandler.newResponse({response: 'Foo', playerId:2});
		responseHandler.newResponse({response: 'Bar', playerId: 5});
		spyOn(stateManager, 'setState').and.callFake(()=>{return;});

		gameDriver.guessReceiver({senderId:123, message:{playerId:1, responseId:1}});
		gameDriver.guessReceiver({senderId:987, message:{playerId:2, responseId:2}});

		expect(guessHandler.tallyGuesses).toHaveBeenCalled();
	});

	it('kicks off another round if the high score was not reached', ()=>{
		spyOn(playerHandler, 'highScore').and.callFake(()=>{return 5;});
		spyOn(stateManager, 'setState').and.callFake(()=>{return;});
		playerHandler.players[0].setState(playerStates.standingBy);
		playerHandler.players[1].setState(playerStates.quit);


		gameDriver.nextRound();

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.ReadyToStart);
		expect(playerHandler.players[0].state).toBe(playerStates.ready);
		expect(playerHandler.players[1].state).toBe(playerStates.quit);
	});

	it('ends the game if the high score was reached', ()=>{
		spyOn(playerHandler, 'highScore').and.callFake(()=>{return 150;});
		spyOn(stateManager, 'setState').and.callFake(()=>{return;});

		gameDriver.nextRound();

		expect(stateManager.setState).toHaveBeenCalledWith(gameStates.GameEnd);
	});

	it('invites players to play again for endGame', ()=>{
		playerHandler.players[0].setState(playerStates.ready);
		playerHandler.players[1].setState(playerStates.ready);
		playerHandler.players[2].setState(playerStates.ready);
		playerHandler.players[3].setState(playerStates.ready);
		playerHandler.players[0].score = 25;
		spyOn(playerHandler, 'highScore').and.callFake(()=>{return 25;});

		gameDriver.endGame();

		expect(messageSender.sendEnd.calls.count()).toBe(4);
	});

	it('sends the winner congratulations', ()=>{
		playerHandler.players[0].setState(playerStates.ready);
		playerHandler.players[1].setState(playerStates.ready);
		playerHandler.players[2].setState(playerStates.ready);
		playerHandler.players[3].setState(playerStates.ready);
		playerHandler.players[0].score = 150;
		playerHandler.players[2].score = 150;
		stateManager.winners.push(playerHandler.players[0]);
		stateManager.winners.push(playerHandler.players[2]);
		spyOn(playerHandler, 'highScore').and.callFake(()=>{return 150;});
		spyOn(eventService, 'publish').and.callFake(()=>{return;});

		gameDriver.endGame();

		expect(eventService.publish).toHaveBeenCalledWith(gameEvents.endView, "");
		expect(messageSender.sendEnd).toHaveBeenCalledWith({senderId: 123, message: 'messagemessage'});
		expect(messageSender.sendEnd).toHaveBeenCalledWith({senderId: 789, message: 'messagemessage'});
	});
});
