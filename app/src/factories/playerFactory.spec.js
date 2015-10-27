'use strict'
describe('playerFactory', ()=>{
	let playerFactory, playerStates, $log, playerName, senderId, playerId, myPlayer;
	beforeEach(angular.mock.module('gameMaster');

	beforeEach(angular.mock.inject(($injector)=>{
		playerFactory = $injector.get('playerFactory', playerFactory);
		playerStates = $injector.get('playerStates', playerStates);
		$log = $injector.get('$log', $log);
		playerName = 'Bob';
		senderId = '22abf14';
		playerId = 62;
		myPlayer = playerFactory.newPlayer(playerName, senderId, playerId);
	}));

	describe('construcor', ()=>{
		it('creates object with correct values', ()=>{

			//assert
			expect(myPlayer.playerName).toBe(playerName);
			expect(myPlayer.senderId).toBe(senderId);
			expect(myPlayer.score).toBe(0);
			expect(myPlayer.state).toBe('');
			expect(myPlayer.playerId).toBe(playerId);
			expect(myPlayer.guessed).toBe(false);
		});
	});

	describe('prototype function', ()=>{
		it('adds points correctly', ()=>{
			myPlayer.addPoints(25);

			expect(myPlayer.score).toBe(25);
		});

		it('marks guessed players', ()=>{
			myPlayer.wasGuessed();

			expect(myPlayer.guessed).toBe(true);
		});

		it('refreshes the guesses for a new round', ()=>{
			myPlayer.wasGuessed();

			myPlayer.freshRound();

			expect(myPlayer.guessed).toBe(false);
		});

		it('refreshes the guesses and score for a new round', ()=>{
			myPlayer.wasGuessed();
			myPlayer.addPoints(5);

			myPlayer.freshGame();

			expect(myPlayer.guessed).toBe(false);
			expect(myPlayer.score).toBe(0);
		});

		it('allows the state to be set dynamically', ()=>{
			myPlayer.setState(playerStates.ready);

			expect(myPlayer.state).toBe(playerStates.ready);
		});

		it('logs an error on a bad state', ()=>{
			spyOn($log, 'log').and.callThrough();
			let fakeState = "fakePlayerState";

			myPlayer.setState(fakeState);

			expect($log.log).toHaveBeenCalled();
		});

		it('does not save a bad state', ()=>{
			let fakeState = "fakePlayerState";

			myPlayer.setState(fakeState);

			expect(myPlayer.state).not.toEqual(fakeState);
		});

		it('compares player states', ()=>{
			myPlayer.setState(playerStates.ready);

			expect(myPlayer.checkState(playerStates.ready)).toBe(true);
		});
	});
});
