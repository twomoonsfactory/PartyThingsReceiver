'use strict'

describe('messageProvider', function(){
	var messageProvider, log, httpBackend, messages, nameGame, url, pname, correct;
	beforeEach(module('gameMaster'));
	beforeEach(inject(function(_messageProvider_,_$log_,_$httpBackend_){
		messageProvider = _messageProvider_;
		log = _$log_;
		httpBackend = _$httpBackend_;
		messages = {messages: [{messageName: "nameGame", message : "Name it!"}, {messageName: "pnameTester", message: "Your name is {PNAME}!"}]};
		url = '../resources/messages.json';
		name = "Bob";
		correct = "Your name is Bob!";
		nameGame = 'nameGame';
	}));

	it('gets the messages', function(){
		httpBackend.whenGET(url).respond(200, messages);
		messageProvider.loadMessages();
		httpBackend.flush();

		expect(messageProvider.messages[0]).toBeDefined;
	});

	it('returns messages', function(){
		httpBackend.whenGET(url).respond(200, messages);
		messageProvider.loadMessages();
		httpBackend.flush();

		var newMessage = messageProvider.getMessage({messageName: nameGame});

		expect(newMessage).toBe(messages.messages[0].message);
	});

	it('does not return faulty messages', function(){
		httpBackend.whenGET(url).respond(200, messages);
		messageProvider.loadMessages();
		httpBackend.flush();

		var newMessage = messageProvider.getMessage({messageName: 'billybob'});

		expect(newMessage).toBe(null);
	});

	it('inserts arguments into messages', function(){
		httpBackend.whenGET(url).respond(200, messages);
		messageProvider.loadMessages();
		httpBackend.flush();

		var newMessage = messageProvider.getMessage({messageName: 'pnameTester', pname: name});

		expect(newMessage).toBe(correct);
	});
});