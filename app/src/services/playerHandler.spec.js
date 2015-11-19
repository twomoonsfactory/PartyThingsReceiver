'use strict'

describe('playerHandler', ()=>{
	let playerHandler, eventService, player, messageSender, stateManager, gameEvents, gameStates, playerStates, messageNames, $log;
	beforeEach(angular.mock.module('gameMaster'));
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
			playerHandler = $injector.get('playerHandler', playerHandler);
			eventService = $injector.get('eventService', eventService);
			player = $injector.get('player', player);
			messageSender = $injector.get('messageSender', messageSender);
			stateManager = $injector.get('stateManager', stateManager);
			gameEvents = $injector.get('gameEvents', gameEvents);
			gameStates = $injector.get('gameStates', gameStates);
			playerStates = $injector.get('playerStates', playerStates);
			messageNames = $injector.get('messageNames', messageNames);
			$log = $injector.get('$log', $log);

			spyOn(messageSender, 'requestGameName').and.callFake(()=>{return;});
			spyOn(messageSender, 'requestPlayerName').and.callFake(()=>{return;});
			spyOn(messageSender, "requestReady").and.callFake(()=>{return;});
			spyOn(messageSender, 'sendQuit').and.callFake(()=>{return;});
			spyOn(stateManager, 'setState').and.callFake(()=>{return;});
			spyOn(messageSender, 'sendStandby').and.callFake(()=>{});

		}));

	it('requests the game AND player names for the first player to join', ()=>{
		spyOn(stateManager, 'checkState').and.callFake(()=>{return true;});
		let player = {senderId: 123};

		playerHandler.addPlayer(player);

		expect(messageSender.requestGameName).toHaveBeenCalled();
		expect(messageSender.requestPlayerName).not.toHaveBeenCalled();
	});

	it('requests just the player name of subsequent players', ()=>{
		spyOn(stateManager, 'checkState').and.callFake(()=>{return false;});
		let player = {senderId: 123};

		playerHandler.addPlayer(player);

		expect(messageSender.requestPlayerName).toHaveBeenCalled();
		expect(messageSender.requestGameName).not.toHaveBeenCalled();
	});

	it('names the game and passes the player name on', ()=>{
		let args = {message: {gameName: "gamename"}};
		spyOn(playerHandler, 'playerNamed').and.callFake(()=>{return;});
		playerHandler.gameNamed(args);

		expect(playerHandler.playerNamed).toHaveBeenCalledWith(args);
	});

	it('get the player objects, confirms creation and sets the correct state', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 234, message:{playerName:"joe"}};
		spyOn(stateManager, 'checkState').and.callFake(function(args){return args === gameStates.WaitingForReady;});

		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);

		expect(playerHandler.players.length).toBe(2);
		expect(playerHandler.players[0].state).toBe(playerStates.readyRequested);
	});

	it('returns unguessed players', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 234, message:{playerName:"joe"}};
		spyOn(stateManager, 'checkState').and.callFake(()=>{return true;});
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		playerHandler.players[0].state = playerStates.ready;
		playerHandler.players[1].state = playerStates.ready;
		playerHandler.players[1].guessed = true;

		let results = playerHandler.getGuessablePlayers();

		expect(results.length).toBe(1);
		expect(results[0].playerName).toBe(args.message.playerName);
	});

	it('assigns points', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		let arg = {playerId: 0, points: 5};

		playerHandler.assignPoints(arg);

		expect(playerHandler.players[0].score).toBe(5);
		expect(playerHandler.players[1].score).toBe(0);
	});

	it('marks players guessed', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		let id = {playerId:1};

		playerHandler.playerGuessed(id);

		expect(playerHandler.players[1].guessed).toBe(true);
		expect(playerHandler.players[0].guessed).toBe(false);
	});

	it('returns true for multiple unguessed players', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);

		let result = playerHandler.unguessedPlayers();

		expect(result).toBe(true);
	});

	it('returns false for only one unguessed player', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);

		playerHandler.playerGuessed({playerId:1});

		let result = playerHandler.unguessedPlayers();

		expect(result).toBe(false);
	});

	it('returns the high score', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		let score1 = {playerId:1, points:20};
		let score2 = {playerId:0, points:5};
		playerHandler.assignPoints(score1);
		playerHandler.assignPoints(score2);

		let results = playerHandler.highScore();

		expect(playerHandler.players[1].score).toBe(score1.points);
		expect(results).toBe(score1.points);
	});

	it('returns the object of the winning player(s)', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 456, message:{playerName:'joe'}};
		let argss = {senderId: 434, message:{playerName:'frank'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		playerHandler.playerNamed(argss);
		let score1 = {playerId:1, points:20};
		let score2 = {playerId:0, points:5};
		let score3 = {playerId:2, points:20};
		playerHandler.assignPoints(score1);
		playerHandler.assignPoints(score2);
		playerHandler.assignPoints(score3);

		let winners = playerHandler.getWinners();

		expect(winners.length).toBe(2);
		expect(winners[0]).toBe(argz.message.playerName);
		expect(winners[1]).toBe(argss.message.playerName);
	});

	it('resets guesses on all players for a new round', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		playerHandler.playerGuessed({playerId:0});
		playerHandler.playerGuessed({playerId:1});
		spyOn(playerHandler, 'getWinners').and.callFake(()=>[]);

		playerHandler.freshRound();

		expect(playerHandler.players[0].guessed).toBe(false);
		expect(playerHandler.players[1].guessed).toBe(false);
	});

	it('resets guesses and scores on all players for a new game', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		let score1 = {playerId:1, points:20};
		let score2 = {playerId:0, points:5};
		playerHandler.assignPoints(score1);
		playerHandler.assignPoints(score2);
		playerHandler.playerGuessed({playerId:0});

		playerHandler.freshGame();

		expect(playerHandler.players[0].guessed).toBe(false);
		expect(playerHandler.players[1].guessed).toBe(false);
		expect(playerHandler.players[0].score).toBe(0);
		expect(playerHandler.players[1].score).toBe(0);
	});

	it('flags the player object and counts correctly for quitting players', ()=>{
		spyOn(stateManager, 'checkState').and.callFake(()=>gameStates.WaitingForStart);
		playerHandler.actedPlayersCount = 1;
		let args = {senderId: 123, message:{playerName:"joe"}};
		playerHandler.playerNamed(args);

		playerHandler.playerQuit({senderId: 123});

		expect(messageSender.sendQuit).toHaveBeenCalled();
		expect(playerHandler.actedPlayersCount).toBe(1);
		expect(playerHandler.activePlayers).toBe(0);
		expect(playerHandler.players[0].state).toBe(playerStates.quit);
		expect(playerHandler.playerCounter).toBe(1);
	});

	it('increments actedPlayersCount', ()=>{
		playerHandler.playerActed();
		playerHandler.playerActed();

		expect(playerHandler.actedPlayersCount).toBe(2);
	});

	it('resets the actedPlayersCount', ()=>{
		playerHandler.actedPlayersCount = 10;

		playerHandler.resetPlayerActedCount();

		expect(playerHandler.actedPlayersCount).toBe(0);
	});

	it('returns the right player', ()=>{
		let args = {senderId: 123, message:{playerName:"bob"}};
		let argz = {senderId: 456, message:{playerName:'joe'}};
		let argss = {senderId: 434, message:{playerName:'frank'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		playerHandler.playerNamed(argss);

		let foundPlayer = playerHandler.findPlayerBySenderId(434);
		let foundPlayer2 = playerHandler.findPlayerBySenderId(123);
		let foundPlayer3 = playerHandler.findPlayerBySenderId(456);

		expect(foundPlayer.playerName).toBe('frank');
		expect(foundPlayer2.playerName).toBe('bob');
		expect(foundPlayer3.playerName).toBe('joe');
	})
});
