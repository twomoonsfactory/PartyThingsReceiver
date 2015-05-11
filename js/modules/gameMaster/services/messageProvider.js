angular.module('gameMaster')
	//parses system stored messages for storage, and will return with variables inserted on call
	.service('messageprovider', ['$log', function($log){
		var self = this;

		self.messages = {};
		$http.get("../resources/messages.json")
			.success(function(data){
				self.messages = data.messages;
				$log.log("Messages loaded in...");
			})
			.error(function(data){
				$log.log("error reading messages");
			});

		//grabs message requested, doing a string replace to input
		//arguments as needed
		//args -> .messageName : the message requested
		//		  .pname : the player name (if needed)
		//        .prompt : the prompt selected (if needed)
		//        .resp : the response (if needed)
		//        .points : numeric points (if needed)
		this.getMessage = function(args){
			var feedback;
			if(_.contains(self.messages, args.messageName)){
				feedback = self.messages[args.messageName];
				feedback = feedback.indexOf("{PNAME}") >= 0 ? feedback.stringReplace("{PNAME}", args.pname) : feedback;
				feedback = feedback.indexOf("{GNAME}") >= 0 ? feedback.stringReplace("{GNAME}", args.gname) : feedback;
				feedback = feedback.indexOf("{PROMPT}") >= 0 ? feedback.stringReplace("{PROMPT}", args.prompt) : feedback;
				feedback = feedback.indexOf("{RESP}") >= 0 ? feedback.stringReplace("{RESP}", args.resp) : feedback;
				feedback = feedback.indexOf("{POINTS}") >= 0 ? feedback.stringReplace("{POINTS}", args.points.toString()) : feedback;
			}
			else{
				$log.log("Message: " + args.messageName + "does not exist");
				feedback = null;
			}
			return feedback;
		}
	}]);