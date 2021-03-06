'use strict'

describe('messageProvider', ()=>{
	let messageProvider, $httpBackend, messages, nameGame, url, pname, correct;
	beforeEach(angular.mock.module('gameMaster'));
	beforeEach(angular.mock.inject(($injector)=>{
		messageProvider = $injector.get('messageProvider', messageProvider);
		$httpBackend = $injector.get('$httpBackend', $httpBackend);
		messages = {messages: [{messageName: "nameGame", message : "Name it!"}, {messageName: "pnameTester", message: "Your name is {PNAME}!"}]};
		url = '../src/resources/messages.json';
		name = "Bob";
		correct = "Your name is Bob!";
		nameGame = 'nameGame';
	}));

	it('gets the messages', ()=>{
		$httpBackend.whenGET(url).respond(200, messages);
		messageProvider.loadMessages();
		$httpBackend.flush();

		expect(messageProvider.messages[0]).toBeDefined;
	});

	it('returns messages', ()=>{
		$httpBackend.whenGET(url).respond(200, messages);
		messageProvider.loadMessages();
		$httpBackend.flush();

		let newMessage = messageProvider.getMessage({messageName: nameGame});

		expect(newMessage).toBe(messages.messages[0].message);
	});

	it('does not return faulty messages', ()=>{
		$httpBackend.whenGET(url).respond(200, messages);
		messageProvider.loadMessages();
		$httpBackend.flush();

		let newMessage = messageProvider.getMessage({messageName: 'billybob'});

		expect(newMessage).toBe(null);
	});

	it('inserts arguments into messages', ()=>{
		$httpBackend.whenGET(url).respond(200, messages);
		messageProvider.loadMessages();
		$httpBackend.flush();

		let newMessage = messageProvider.getMessage({messageName: 'pnameTester', pname: name});

		expect(newMessage).toBe(correct);
	});
});
