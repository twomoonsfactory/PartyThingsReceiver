'use strict'
describe('responseProvider', function(){
	var responseProvider, $log, eventService, gameStates, httpBackend, url, responsesProvided;
	beforeEach(module('gameMaster'));
	beforeEach(inject(function(_responseProvider_, _$log_, _eventService_, _gameStates_, _$httpBackend_){
		responseProvider = _responseProvider_;
		$log = _$log_;
		eventService = _eventService_;
		gameStates = _gameStates_;
		httpBackend = _$httpBackend_;
		url = '../resources/responses.json';
		responsesProvided = [
	"Super Mario Bros.",
	"Green Eggs and Ham.",
	"Squishing a slug with your toes.",
	"Drop an icecube down their shirt."];
	spyOn($log, 'log').and.callThrough();
	}));	

	beforeEach(function(){
		httpBackend.whenGET(url).respond(200, responsesProvided);
		responseProvider.loadResponses();
		httpBackend.flush();
	});

	it('pulls in responses', function(){
		expect(responseProvider.responses.length).toBe(4);
	});

	it('sends back one of the potential responses', function(){
		var results = responseProvider.getResponse();

		expect(_.contains(responsesProvided, results)).toBe(true);
	});
});