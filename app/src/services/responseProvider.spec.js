'use strict'
describe('responseProvider', ()=>{
	let responseProvider, $log, eventService, gameStates, $httpBackend, url, responsesProvided;
	beforeEach(angular.mock.module(require('../app.js').name));
	beforeEach(angular.mock.inject(($injector)=>{
		responseProvider = $injector.get('responseProvider', responseProvider);
		$log = $injector.get('$log', 'log');
		eventService = $injector.get('eventService', eventService);
		gameStates = $injector.get('gameStates', gameStates);
		$httpBackend = $injector.get('$httpBackend', $httpBackend);
		url = '../src/resources/responses.json';
		responsesProvided = {responses: [
		"Super Mario Bros.",
		"Green Eggs and Ham.",
		"Squishing a slug with your toes.",
		"Drop an icecube down their shirt."]};
		spyOn($log, 'log').and.callThrough();
		$httpBackend.whenGET(url).respond(200, responsesProvided);
		responseProvider.loadResponses();
		$httpBackend.flush();
	}));


	it('pulls in responses', ()=>{
		expect(responseProvider.responses.length).toBe(4);
	});

	it('sends back one of the potential responses', ()=>{
		let results = responseProvider.getRandomResponse();

		expect(_.contains(responsesProvided.responses, results)).toBe(true);
	});
});
