'use strict'

describe('promptProvider', ()=>{
	let promptProvider, $log, eventService, gameStates, $httpBackend, url, promptsProvided;
	beforeEach(angular.mock.module('gameMaster'));
	beforeEach(angular.mock.inject(($injector)=>{
		promptProvider = $injector.get('promptProvider', promptProvider);
		$log = $injector.get('$log', $log);
		eventService = $injector.get('eventService', eventService);
		gameStates = $injector.get('gameStates', gameStates);
		$httpBackend = $injector.get('$httpBackend', $httpBackend);
		url = '../src/resources/prompts.json';
		promptsProvided = {prompts:[
	"Things that don't belong together.",
	"Things you will always say yes to.",
	"Things your stunt double could do for you.",
	"Things that keep you up at night."]};
	}));

	beforeEach(()=>{
		$httpBackend.whenGET(url).respond(200, promptsProvided);
		promptProvider.loadPrompts();
		$httpBackend.flush();
		promptProvider.getPrompts();
	});

	it('gets the prompts', ()=>{
		// $httpBackend.whenGET(url).respond(200, promptsProvided);
		// promptProvider.loadPrompts();
		// $httpBackend.flush();

		expect(promptProvider.prompts.length).toBe(4);
	});
	//
	// it('pulls three random prompts', ()=>{
	// 	expect(promptProvider.currentprompts.length).toBe(3);
	// });
	//
	// it('assigns votes properly', ()=>{
	// 	promptProvider.promptVote(0);
	// 	promptProvider.promptVote(0);
	// 	promptProvider.promptVote(1);
	// 	promptProvider.promptVote(2);
	// 	promptProvider.promptVote(0);
	// 	promptProvider.promptVote(2);
	// 	let expectedResults = [3,1,2];
	//
	// 	expect(promptProvider.votes[0]).toBe(expectedResults[0]);
	// 	expect(promptProvider.votes[1]).toBe(expectedResults[1]);
	// 	expect(promptProvider.votes[2]).toBe(expectedResults[2]);
	// });
	//
	// it('counts votes', ()=>{
	// 	promptProvider.promptVote(0);
	// 	promptProvider.promptVote(0);
	// 	promptProvider.promptVote(1);
	// 	promptProvider.promptVote(2);
	// 	promptProvider.promptVote(0);
	// 	promptProvider.promptVote(2);
	//
	// 	promptProvider.tallyVotes();
	//
	// 	expect(promptProvider.prompt).toBe(promptProvider.currentprompts[0]);
	// });

	it('returns a random vote in the case of a tie', ()=>{
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
