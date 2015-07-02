module.exports = function($log, $http, eventService, gameEvents){
		var self = this;

		self.messages = [];
		this.loadMessages = function(){
			$http.get("http://twomoonsfactory.github.io/PartyThingsReceiver/app/src/resources/messages.json")
				.success(function(data){
					self.messages = data.messages;
					$log.log("Messages loaded in...");
					eventService.publish(gameEvents.messageLoaded, "");
				})
				.error(function(data){
					$log.log("error reading messages");
				});
		}
		eventService.subscribe(gameEvents.welcomeLoaded, this.loadMessages);

		//grabs message requested, doing a string replace to input
		//arguments as needed
		//args -> .messageName : the message requested
		//		  .pname : the player name (if needed)
		//        .prompt : the prompt selected (if needed)
		//        .resp : the response (if needed)
		//        .points : numeric points (if needed)
		this.getMessage = function(args){
			var feedback;
			if((_.findWhere(self.messages, {messageName: args.messageName}))!==undefined){
				feedback = _.findWhere(self.messages, {messageName: args.messageName}).message;
				feedback = feedback.indexOf("{PNAME}") >= 0 ? feedback.replace("{PNAME}", args.pname) : feedback;
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
	};