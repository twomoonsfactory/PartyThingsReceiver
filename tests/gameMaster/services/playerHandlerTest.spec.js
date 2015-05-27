'use strict'

describe('playerHandler', function(){
	var playerHandler, eventService, player, messageSender, stateManager, gameEvents, gameStates, playerStates, messageNames, $log;
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

	beforeEach(inject(function(_playerHandler_,_eventService_,_player_,_messageSender_,_stateManager_,_gameStates_,_playerStates_,_gameEvents_,_messageNames_,_$log_){
		playerHandler = _playerHandler_;
		eventService = _eventService_;
		player = _player_;
		messageSender = _messageSender_;
		stateManager = _stateManager_;
		gameEvents = _gameEvents_;
		gameStates = _gameStates_;
		playerStates = _playerStates_;
		messageNames = _messageNames_;
		$log = _$log_;

		spyOn(messageSender, 'requestGameName').and.callFake(function(){return;});
		spyOn(messageSender, 'requestPlayerName').and.callFake(function(){return;});
		spyOn(messageSender, "requestReady").and.callFake(function(){return;});
		spyOn(messageSender, 'sendQuit').and.callFake(function(){return;});
		spyOn(stateManager, 'setState').and.callFake(function(){return;});
		spyOn(messageSender, 'sendStandby').and.callFake(function(){return;});

	})); 

	it('requests the game AND player names for the first player to join', function(){
		spyOn(stateManager, 'checkState').and.callFake(function(){return true;});
		var player = {senderId: 123};
		
		playerHandler.addPlayer(player);

		expect(messageSender.requestGameName).toHaveBeenCalled();
		expect(messageSender.requestPlayerName).not.toHaveBeenCalled();
		expect(stateManager.setState).toHaveBeenCalled();
	});

	it('requests just the player name of subsequent players', function(){
		spyOn(stateManager, 'checkState').and.callFake(function(){return false;});
		var player = {senderId: 123};

		playerHandler.addPlayer(player);

		expect(messageSender.requestPlayerName).toHaveBeenCalled();
		expect(messageSender.requestGameName).not.toHaveBeenCalled();
	});
	
	it('names the game and passes the player name on', function(){
		var args = {message: {gameName: "gamename"}};
		spyOn(playerHandler, 'playerNamed').and.callFake(function(){return;});
		playerHandler.gameNamed(args);

		expect(playerHandler.playerNamed).toHaveBeenCalledWith(args);
	});

	it('get the player objects, confirms creation and sets the correct state', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 234, message:{playerName:"joe"}};
		spyOn(stateManager, 'checkState').and.callFake(function(args){return args === gameStates.WaitingForReady;});

		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);

		expect(playerHandler.players.length).toBe(2);
		expect(playerHandler.players[0].state).toBe(playerStates.readyRequested);
	});

	it('returns unguessed players', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 234, message:{playerName:"joe"}};
		spyOn(stateManager, 'checkState').and.callFake(function(){return true;});
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		playerHandler.players[0].state = playerStates.ready;
		playerHandler.players[1].state = playerStates.ready;
		playerHandler.players[1].guessed = true;

		var results = playerHandler.getElegiblePlayers();

		expect(results.length).toBe(1);
		expect(results[0].playerName).toBe(args.message.playerName);
	});

	it('assigns points', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		var arg = {playerId: 0, points: 5};
		
		playerHandler.assignPoints(arg);

		expect(playerHandler.players[0].score).toBe(5);
		expect(playerHandler.players[1].score).toBe(0);
	});

	it('marks players guessed', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		var id = {playerId:1};

		playerHandler.playerGuessed(id);

		expect(playerHandler.players[1].guessed).toBe(true);
		expect(playerHandler.players[0].guessed).toBe(false);
	});

	it('returns true for multiple unguessed players', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);

		var result = playerHandler.unguessedPlayers();

		expect(result).toBe(true);
	});

	it('returns false for only one unguessed player', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);

		playerHandler.playerGuessed({playerId:1});

		var result = playerHandler.unguessedPlayers();

		expect(result).toBe(false);
	});

	it('returns the high score', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		var score1 = {playerId:1, points:20};
		var score2 = {playerId:0, points:5};
		playerHandler.assignPoints(score1);
		playerHandler.assignPoints(score2);

		var results = playerHandler.highScore();

		expect(playerHandler.players[1].score).toBe(score1.points);
		expect(results).toBe(score1.points);
	});

	it('returns the object of the winning player(s)', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 456, message:{playerName:'joe'}};
		var argss = {senderId: 434, message:{playerName:'frank'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		playerHandler.playerNamed(argss);
		var score1 = {playerId:1, points:20};
		var score2 = {playerId:0, points:5};
		var score3 = {playerId:2, points:20};
		playerHandler.assignPoints(score1);
		playerHandler.assignPoints(score2);
		playerHandler.assignPoints(score3);

		var winners = playerHandler.getWinners();

		expect(winners.length).toBe(2);
		expect(winners[0].playerName).toBe(argz.message.playerName);
		expect(winners[1].playerName).toBe(argss.message.playerName);
	});

	it('resets guesses on all players for a new round', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		playerHandler.playerGuessed({playerId:0});
		playerHandler.playerGuessed({playerId:1});

		playerHandler.freshRound();

		expect(playerHandler.players[0].guessed).toBe(false);
		expect(playerHandler.players[1].guessed).toBe(false);
	});

	it('resets guesses and scores on all players for a new game', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 123, message:{playerName:'joe'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		var score1 = {playerId:1, points:20};
		var score2 = {playerId:0, points:5};
		playerHandler.assignPoints(score1);
		playerHandler.assignPoints(score2);
		playerHandler.playerGuessed({playerId:0});
		
		playerHandler.freshGame();

		expect(playerHandler.players[0].guessed).toBe(false);
		expect(playerHandler.players[1].guessed).toBe(false);
		expect(playerHandler.players[0].score).toBe(0);
		expect(playerHandler.players[1].score).toBe(0);
	});

	it('flags the player object and counts correctly for quitting players', function(){
		playerHandler.actedPlayersCount = 1;
		var args = {senderId: 123, message:{playerName:"joe"}};
		playerHandler.playerNamed(args);
		playerHandler.players[0].state = playerStates.ready;

		playerHandler.playerQuit({senderId: 123});

		expect(messageSender.sendQuit).toHaveBeenCalled();
		expect(playerHandler.actedPlayersCount).toBe(0);
		expect(playerHandler.activePlayers).toBe(0);
		expect(playerHandler.players[0].state).toBe(playerStates.quit);
		expect(playerHandler.playerCounter).toBe(1);
	});

	it('increments actedPlayersCount', function(){
		playerHandler.playerActed();
		playerHandler.playerActed();

		expect(playerHandler.actedPlayersCount).toBe(2);
	});

	it('resets the actedPlayersCount', function(){
		playerHandler.actedPlayersCount = 10;

		playerHandler.resetPlayerActedCount();

		expect(playerHandler.actedPlayersCount).toBe(0);
	});

	it('returns the right player', function(){
		var args = {senderId: 123, message:{playerName:"bob"}};
		var argz = {senderId: 456, message:{playerName:'joe'}};
		var argss = {senderId: 434, message:{playerName:'frank'}};
		playerHandler.playerNamed(args);
		playerHandler.playerNamed(argz);
		playerHandler.playerNamed(argss);

		var foundPlayer = playerHandler.findPlayer(434);
		var foundPlayer2 = playerHandler.findPlayer(123);
		var foundPlayer3 = playerHandler.findPlayer(456);

		expect(foundPlayer.playerName).toBe('frank');
		expect(foundPlayer2.playerName).toBe('bob');
		expect(foundPlayer3.playerName).toBe('joe');
	})
});