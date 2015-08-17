export default class messageProvider{
	constructor($log, $http, eventService, gameEvents){
		this.messages = [];
		//local references to externals
		this.log = $log;
		this.http = $http;
		this.eventService = eventService;
		this.gameEvents = gameEvents;
		//event subscriptions
		this.eventService.subscribe(this.gameEvents.welcomeLoaded, this.loadMessages);
	}
	//loads messages from json
	loadMessages(){
		this.http.get("../src/resources/messages.json")
			.then(data => {
				this.messages = data.messages;
				this.log.log("Messages loaded in...");
				this.eventService.publish(this.gameEvents.messageLoaded, "");
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
	getMessage(args){
		let feedback;
		if((_.findWhere(this.messages, {messageName: args.messageName}))!==undefined){
			feedback = _.findWhere(this.messages, {messageName: args.messageName}).message;
			feedback = feedback.indexOf("{PNAME}") >= 0 ? feedback.replace("{PNAME}", args.pname) : feedback;
			feedback = feedback.indexOf("{PNAME2}") >= 0 ? feedback.replace("{PNAME2}", args.pname2) : feedback;
			feedback = feedback.indexOf("{GNAME}") >= 0 ? feedback.replace("{GNAME}", args.gname) : feedback;
			feedback = feedback.indexOf("{PROMPT}") >= 0 ? feedback.replace("{PROMPT}", args.prompt) : feedback;
			feedback = feedback.indexOf("{RESP}") >= 0 ? feedback.replace("{RESP}", args.resp) : feedback;
			feedback = feedback.indexOf("{POINTS}") >= 0 ? feedback.replace("{POINTS}", args.points.toString()) : feedback;
		}
		else{
			this.log.log("Message: " + args.messageName + "does not exist");
			feedback = null;
		}
		return feedback;
	}
}
messageProvider.$inject = ['$log', '$http', 'eventService', 'gameEvents'];
