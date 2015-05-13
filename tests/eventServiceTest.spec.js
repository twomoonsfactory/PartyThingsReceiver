'use strict'
describe('eventService', function(){
	var eventService, test, newEvent, otherEvent, $log, gameEvents, gameStates;
	beforeEach(module('gameMaster'));

	beforeEach(inject(function(_eventService_,_$log_,_gameEvents_,_gameStates_){
		eventService = _eventService_;
		$log = _$log_;
		gameEvents = _gameEvents_;
		gameStates = _gameStates_;
		newEvent = gameEvents.readyReceived;
		otherEvent = gameStates.GameEnd;
		test= {
			functionWasCalled : function(){return true},
			quickFunction : function(){return false}
		}

		spyOn($log, 'log').and.callThrough();
		spyOn(test, 'functionWasCalled').and.callThrough();
		spyOn(test, 'quickFunction').and.callThrough();
	}));

	describe('subscriber', function(){
		it('adds a new subscriber', function(){
			eventService.subscribe(newEvent, test.functionWasCalled);

			expect(eventService.subs[newEvent]).toContain(test.functionWasCalled);
		});

		it('logs an error for invalid events/states', function(){
			eventService.subscribe("fakeEvent", test.functionWasCalled);

			expect($log.log).toHaveBeenCalled();
		});

		it('does not store functions for invalid events/state', function(){
			eventService.subscribe('fakeEvent', test.functionWasCalled);

			expect(eventService.subs['fakeEvent']).toBe(undefined);
		});

		if('stores multiples in one array and adds a new hash for other functions', function(){
			eventService.subscribe(newEvent, test.functionWasCalled);
			eventService.subscribe(otherEvent, test.quickFunction);
			eventService.subscribe(newEvent, test.quickFunction);

			expect(eventService.subs[newEvent]).toContain(test.functionWasCalled);
			expect(eventService.subs[newEvent]).toContain(test.quickFunction);
			expect(eventService.subs[otherEvent]).toContain(test.quickFunction);
			expect(eventService.subs[otherEvent]).not.toContain(test.functionWasCalled);
		});
	});

	describe('publisher', function(){
		it('calls subscribed functions on a published event', function(){
			eventService.subs = {};
			eventService.subscribe(newEvent, test.functionWasCalled);
			eventService.subscribe(otherEvent, test.quickFunction);
			eventService.subscribe(newEvent, test.quickFunction);

			eventService.publish(newEvent, '');
			expect(test.functionWasCalled.calls.count()).toEqual(1);
			expect(test.quickFunction.calls.count()).toEqual(1);
		});
	});
});