module.exports = angular.module('gameMaster')
	.constant('gameEvents', {
		playerJoined: "playerJoined",
		readyReceived: "readyReceived",
		voteReceived: "voteReceived",
		thingReceived: "thingReceived",
		guessReceived: "guessReceived",
		gamenameReceived: "gamenameReceived",
		playernameReceived: "playernameReceived",
		quitReceived: "quitReceived"
	});