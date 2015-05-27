'use strict'
describe('playerFactory', function(){
	var player, playerStates, $log, playerName, senderId, playerId, myPlayer;	
	beforeEach(module('gameMaster'));

	beforeEach(inject(function(_player_,_playerStates_,_$log_){
		player = _player_;
		playerStates = _playerStates_;
		$log = _$log_;
		playerName = 'Bob';
		senderId = '22abf14';
		playerId = 62;
		myPlayer = new player(playerName, senderId, playerId);
	}));

	describe('construcor', function(){
		it('creates object with correct values', function(){
			
			//assert
			expect(myPlayer.playerName).toBe(playerName);
			expect(myPlayer.senderId).toBe(senderId);
			expect(myPlayer.score).toBe(0);
			expect(myPlayer.state).toBe('');
			expect(myPlayer.playerId).toBe(playerId);
			expect(myPlayer.guessed).toBe(false);
		});
	});

	describe('prototype function', function(){
		it('adds points correctly', function(){
			myPlayer.addPoints(25);

			expect(myPlayer.score).toBe(25);
		});

		it('marks guessed players', function(){
			myPlayer.wasGuessed();

			expect(myPlayer.guessed).toBe(true);
		});

		it('refreshes the guesses for a new round', function(){
			myPlayer.wasGuessed();
			
			myPlayer.freshRound();

			expect(myPlayer.guessed).toBe(false);
		});

		it('refreshes the guesses and score for a new round', function(){
			myPlayer.wasGuessed();
			myPlayer.addPoints(5);

			myPlayer.freshGame();

			expect(myPlayer.guessed).toBe(false);
			expect(myPlayer.score).toBe(0);
		});

		it('allows the state to be set dynamically', function(){
			myPlayer.setState(playerStates.ready);

			expect(myPlayer.state).toBe(playerStates.ready);
		});

		it('logs an error on a bad state', function(){
			spyOn($log, 'log').and.callThrough();
			var fakeState = "fakePlayerState";

			myPlayer.setState(fakeState);

			expect($log.log).toHaveBeenCalled();
		});

		it('does not save a bad state', function(){
			var fakeState = "fakePlayerState";

			myPlayer.setState(fakeState);

			expect(myPlayer.state).not.toEqual(fakeState);
		});

		it('compares player states', function(){
			myPlayer.setState(playerStates.ready);

			expect(myPlayer.checkState(playerStates.ready)).toBe(true);
		});
	});
});
