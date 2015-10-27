'use strict'

describe('eventService', ()=>{
	let eventService, test, newEvent, otherEvent, $log, gameEvents, gameStates;

	beforeEach(angular.mock.module('gameMaster');
	beforeEach(angular.mock.inject(($injector)=>{
		eventService = $injector.get('eventService', eventService);
		$log = $injector.get('$log', $log);
		gameEvents = $injector.get('gameEvents', gameEvents);
		gameStates = $injector.get('gameStates', gameStates);
		newEvent = gameEvents.readyReceived;
		otherEvent = gameStates.GameEnd;
		test = {
			functionWasCalled : ()=>true,
			quickFunction: ()=>false
		}
		spyOn($log, 'log').and.callThrough();
		spyOn(test, 'functionWasCalled').and.callThrough();
		spyOn(test, 'quickFunction').and.callThrough();
	}));

	describe('subscriber', ()=>{
		it('adds a new subscriber', ()=>{
			eventService.subscribe(newEvent, test.functionWasCalled);

			expect(eventService.subs[newEvent]).toContain(test.functionWasCalled);
		});

		it('logs an error for invalid events/states', ()=>{
			eventService.subscribe("fakeEvent", test.functionWasCalled);

			expect($log.log).toHaveBeenCalled();
		});

		it('does not store functions for invalid events/state', ()=>{
			eventService.subscribe('fakeEvent', test.functionWasCalled);

			expect(eventService.subs['fakeEvent']).toBe(undefined);
		});

		if('stores multiples in one array and adds a new hash for other functions', ()=>{
			eventService.subscribe(newEvent, test.functionWasCalled);
			eventService.subscribe(otherEvent, test.quickFunction);
			eventService.subscribe(newEvent, test.quickFunction);

			expect(eventService.subs[newEvent]).toContain(test.functionWasCalled);
			expect(eventService.subs[newEvent]).toContain(test.quickFunction);
			expect(eventService.subs[otherEvent]).toContain(test.quickFunction);
			expect(eventService.subs[otherEvent]).not.toContain(test.functionWasCalled);
		});
	});

	describe('publisher', ()=>{
		it('calls subscribed functions on a published event', ()=>{
			eventService.subscribe(newEvent, test.functionWasCalled);
			eventService.subscribe(otherEvent, test.quickFunction);
			eventService.subscribe(newEvent, test.quickFunction);

			eventService.publish(newEvent, {args: 'args'});
			expect(test.functionWasCalled.calls.count()).toEqual(1);
			expect(test.quickFunction.calls.count()).toEqual(1);
		});
		it('does not call invalid published events and logs the error', ()=>{
			eventService.subscribe(otherEvent, test.quickFunction);

			eventService.publish(newEvent, {args: 'args'});
			expect(test.functionWasCalled).not.toHaveBeenCalled();
			expect($log.log).toHaveBeenCalled();
		});
	});
});
