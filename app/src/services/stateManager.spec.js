'use strict'

describe('Service: stateManager', ()=>{
	let stateManager, eventService, gameStates, $log;
	beforeEach(angular.mock.module(require('../app.js').name));
	beforeEach(inject(($injector)=>{
		stateManager = $injector.get('stateManager', stateManager);
		eventService = $injector.get('eventService', eventService);
		gameStates = $injector.get('gameStates', gameStates);
		$log = $injector.get('$log', $log);
		spyOn(eventService, 'publish').and.callFake(()=>{return;});
		spyOn($log, 'log').and.callThrough();
		stateManager.setState(gameStates.ReadyToStart);
	}));

	it('sets the state and publishes the change', ()=>{
		expect(stateManager.state).toBe(gameStates.ReadyToStart);
		expect(eventService.publish).toHaveBeenCalledWith(gameStates.ReadyToStart, gameStates.ReadyToStart);
	});

	it('does not republish for duplicate setting', ()=>{
		stateManager.setState(gameStates.ReadyToStart);
		//2 calls for each successful set -- once for the state change, another for a message update.
		expect(eventService.publish.calls.count()).toBe(2);
		expect($log.log).toHaveBeenCalledWith('Already in : ' + gameStates.ReadyToStart);
	});

	it('does republish for separate settings', ()=>{
		stateManager.setState(gameStates.PromptChosen);

		expect(eventService.publish.calls.count()).toBe(4);
	});

	it('throws an error on invalid state setting', ()=>{
		stateManager.setState('garbage');
		expect(eventService.publish.calls.count()).toBe(2);
		expect($log.log).toHaveBeenCalledWith('Attempted to enter invalid gamestate: garbage');
	});

	it('accurately compares states', ()=>{
		let real = stateManager.checkState(gameStates.ReadyToStart);
		let fake = stateManager.checkState(gameStates.PromptChosen);

		expect(real).toBe(true);
		expect(fake).toBe(false);
	})
});
