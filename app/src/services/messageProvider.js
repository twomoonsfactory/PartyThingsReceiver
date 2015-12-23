export default ngModule => {
	class messageProvider{
		constructor($log, $http, eventService, gameEvents){
				this.$log = $log;
				this.$http = $http;
				this.eventService = eventService;
				this.gameEvents = gameEvents;

				this.messages = [];

				this.subscribeToGameEvents();
		}
		subscribeToGameEvents(){
			this.eventService.subscribe(this.gameEvents.welcomeLoaded, this.loadMessages.bind(this));
		}

		//pulls messages from server
		loadMessages(){
			this.$http.jsonp("http://www.twomoonsfactory.com/resources/jsons/messages.json?callback=JSON_CALLBACK")
				.success(data => {
					this.messages = data.messages;
					this.$log.log("Messages loaded in...");
					this.eventService.publish(this.gameEvents.messageLoaded, "");
				})
				.error(data => {
					this.$log.log("error reading messages");
				});
		}

		//grabs message requested, doing a string replace to input
		//arguments as needed
		//args -> .messageName : the message requested
		//		  .pname : the player name (if needed)
		//        .pname2 : the second playerName in message (if needed)
		//        .prompt : the prompt selected (if needed)
		//        .resp : the response (if needed)
		//        .points : numeric points (if needed)
		// added support such that the "message" can be an array of possible messages instead of just one, and one will be pulled at random.
		getMessage(args){
			let source = '';
			let compiledMessage = '';
			if((_.findWhere(this.messages, {messageName: args.messageName}))!==undefined){
				source = _.findWhere(this.messages, {messageName: args.messageName}).message;
				compiledMessage = Array.isArray(source) ? _.sample(source) : source;
				compiledMessage = compiledMessage.indexOf("{PNAME}") >= 0 ? compiledMessage.replace("{PNAME}", args.pname) : compiledMessage;
				compiledMessage = compiledMessage.indexOf("{PNAME2}") >= 0 ? compiledMessage.replace("{PNAME2}", args.pname2) : compiledMessage;
				compiledMessage = compiledMessage.indexOf("{GNAME}") >= 0 ? compiledMessage.replace("{GNAME}", args.gname) : compiledMessage;
				compiledMessage = compiledMessage.indexOf("{PROMPT}") >= 0 ? compiledMessage.replace("{PROMPT}", args.prompt) : compiledMessage;
				compiledMessage = compiledMessage.indexOf("{RESP}") >= 0 ? compiledMessage.replace("{RESP}", args.resp) : compiledMessage;
				compiledMessage = compiledMessage.indexOf("{POINTS}") >= 0 ? compiledMessage.replace("{POINTS}", args.points.toString()) : compiledMessage;
			}
			else{
				this.$log.log("Message: " + args.messageName + "does not exist");
				compiledMessage = null;
			}
			return compiledMessage;
		}

		//args -> .messageType - the array to pull a message from
		//				.pname : player name(s)
		//				.points : numeric points
		getToastMessage(args){
			let compiledMessage = '';
			if((_.findWhere(this.messages, {messageName: args.messageType}))!==undefined){
				compiledMessage = _.sample(_.findWhere(this.messages, {messageName: args.messageType}).message);
				compiledMessage = compiledMessage.indexOf("{PNAME}") >= 0 ? compiledMessage.replace("{PNAME}", args.pname) : compiledMessage;
				compiledMessage = compiledMessage.indexOf("{POINTS}") >= 0 ? compiledMessage.replace("{POINTS}", args.points.toString()) : compiledMessage;
			}
			else{
				this.$log.log("Message: " + args.messageName + "does not exist");
				compiledMessage = null;
			}
			return compiledMessage;
		}
	}
	messageProvider.$inject = ['$log', '$http', 'eventService', 'gameEvents'];
	ngModule.service('messageProvider', messageProvider);
}
