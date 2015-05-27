'use strict'

describe('promptProvider', function(){
	var promptProvider, $log, eventService, gameStates, httpBackend, url, promptsProvided;
	beforeEach(module('gameMaster'));
	beforeEach(inject(function(_promptProvider_, _$log_, _eventService_, _gameStates_, _$httpBackend_){
		promptProvider = _promptProvider_;
		$log = _$log_;
		eventService = _eventService_;
		gameStates = _gameStates_;
		httpBackend = _$httpBackend_;
		url = '../resources/prompts.json';
		promptsProvided = [
	"Things that don't belong together.",
	"Things you will always say yes to.",
	"Things your stunt double could do for you.",
	"Things that keep you up at night."];
	}));

	beforeEach(function(){
		httpBackend.whenGET(url).respond(200, promptsProvided);
		promptProvider.loadPrompts();
		httpBackend.flush();

		promptProvider.getPrompts();
	});

	it('gets the prompts', function(){
		httpBackend.whenGET(url).respond(200, promptsProvided);
		promptProvider.loadPrompts();
		httpBackend.flush();

		expect(promptProvider.prompts.length).toBe(4);
	});

	it('pulls three random prompts', function(){
		expect(promptProvider.currentprompts.length).toBe(3);
	});

	it('assigns votes properly', function(){
		promptProvider.promptVote(0);
		promptProvider.promptVote(0);
		promptProvider.promptVote(1);
		promptProvider.promptVote(2);
		promptProvider.promptVote(0);
		promptProvider.promptVote(2);
		var expectedResults = [3,1,2];

		expect(promptProvider.votes[0]).toBe(expectedResults[0]);
		expect(promptProvider.votes[1]).toBe(expectedResults[1]);
		expect(promptProvider.votes[2]).toBe(expectedResults[2]);
	});

	it('counts votes', function(){
		promptProvider.promptVote(0);
		promptProvider.promptVote(0);
		promptProvider.promptVote(1);
		promptProvider.promptVote(2);
		promptProvider.promptVote(0);
		promptProvider.promptVote(2);

		promptProvider.tallyVotes();

		expect(promptProvider.prompt).toBe(promptProvider.currentprompts[0]);
	});

	it('returns a random vote in the case of a tie', function(){
		promptProvider.promptVote(0);
		promptProvider.promptVote(1);
		promptProvider.promptVote(2);
		promptProvider.promptVote(0);
		promptProvider.promptVote(2);

		promptProvider.tallyVotes();

		expect(promptProvider.prompt).toBeDefined();
		expect(promptProvider.prompt).not.toBe(promptProvider.currentprompts[1]);
	});
})