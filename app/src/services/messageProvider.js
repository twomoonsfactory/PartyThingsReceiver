export default ngModule => {
	ngModule.service('messageProvider', ['$log', '$http', 'eventService', 'gameEvents', ($log, $http, eventService, gameEvents)=>{
		let self = this;

		self.messages = [];
		this.loadMessages = ()=>{
			$http.get("../src/resources/messages.json")
				.success(data => {
					self.messages = data.messages;
					$log.log("Messages loaded in...");
					eventService.publish(gameEvents.messageLoaded, "");
				})
				.error(data => {
					$log.log("error reading messages");
				});
		}
		eventService.subscribe(gameEvents.welcomeLoaded, this.loadMessages);

		//grabs message requested, doing a string replace to input
		//arguments as needed
		//args -> .messageName : the message requested
		//		  .pname : the player name (if needed)
		//        .pname2 : the second playerName in message (if needed)
		//        .prompt : the prompt selected (if needed)
		//        .resp : the response (if needed)
		//        .points : numeric points (if needed)
		this.getMessage = args => {
			let feedback;
			if((_.findWhere(self.messages, {messageName: args.messageName}))!==undefined){
				feedback = _.findWhere(self.messages, {messageName: args.messageName}).message;
				feedback = feedback.indexOf("{PNAME}") >= 0 ? feedback.replace("{PNAME}", args.pname) : feedback;
				feedback = feedback.indexOf("{PNAME2}") >= 0 ? feedback.replace("{PNAME2}", args.pname2) : feedback;
				feedback = feedback.indexOf("{GNAME}") >= 0 ? feedback.replace("{GNAME}", args.gname) : feedback;
				feedback = feedback.indexOf("{PROMPT}") >= 0 ? feedback.replace("{PROMPT}", args.prompt) : feedback;
				feedback = feedback.indexOf("{RESP}") >= 0 ? feedback.replace("{RESP}", args.resp) : feedback;
				feedback = feedback.indexOf("{POINTS}") >= 0 ? feedback.replace("{POINTS}", args.points.toString()) : feedback;
			}
			else{
				$log.log("Message: " + args.messageName + "does not exist");
				feedback = null;
			}
			return feedback;
		}
	}])
}
