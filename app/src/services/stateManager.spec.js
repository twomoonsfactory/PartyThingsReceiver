'use strict'
// var gameMaster = require('../app.js');
// var stateManager = require('../services/stateManager.js');

describe('Service: stateManager', function(){
	it('should run a test', function(){
		var run = true;
	});
	// beforeEach(function(){
	// 	var module = require("../app.js");
	// });
	// var stateManager, eventService, gameStates, $log;
	// beforeEach(mock( require('../app.js').name ));
	// beforeEach(inject(function(_stateManager_, _eventService_, _gameStates_, _$log_){
	// 	stateManager = _stateManager_;
	// 	eventService = _eventService_;
	// 	gameStates = _gameStates_;
	// 	$log = _$log_;
	// }));
	//
	// beforeEach(function(){
	// 	spyOn(eventService, 'publish').and.callFake(function(){return;});
	// 	spyOn($log, 'log').and.callThrough();
	// 	stateManager.setState(gameStates.PlayersReady);
	// });
	//
	// it('sets the state and publishes the change', function(){
	// 	expect(stateManager.state).toBe(gameStates.PlayersReady);
	// 	expect(eventService.publish).toHaveBeenCalledWith(gameStates.PlayersReady, gameStates.PlayersReady);
	// });
	//
	// it('does not republish for duplicate setting', function(){
	// 	stateManager.setState(gameStates.PlayersReady);
	//
	// 	expect(eventService.publish.calls.count()).toBe(1);
	// 	expect($log.log).toHaveBeenCalledWith('Already in : ' + gameStates.PlayersReady);
	// });
	//
	// it('does republish for separate settings', function(){
	// 	stateManager.setState(gameStates.PromptChosen);
	// 	expect(eventService.publish.calls.count()).toBe(2);
	// });
	//
	// it('throws an error on invalid state setting', function(){
	// 	stateManager.setState('garbage');
	// 	expect(eventService.publish.calls.count()).toBe(1);
	// 	expect($log.log).toHaveBeenCalledWith('Attempted to enter invalid gamestate: garbage');
	// });
	//
	// it('accurately compares states', function(){
	// 	var real = stateManager.checkState(gameStates.PlayersReady);
	// 	var fake = stateManager.checkState(gameStates.PromptChosen);
	//
	// 	expect(real).toBe(true);
	// 	expect(fake).toBe(false);
	// })
});
