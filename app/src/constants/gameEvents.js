export default ngModule => {
	ngModule.constant('gameEvents', {
		playerJoined: "playerJoined",
		readyReceived: "readyReceived",
		voteReceived: "voteReceived",
		responseReceived: "responseReceived",
		guessReceived: "guessReceived",
		guessesResolved: "guessesResolved",
		guessesSorted: "guessesSorted",
		gamenameReceived: "gamenameReceived",
		gameNamed: "gameNamed",
		messageLoaded: "messageLoaded",
		messagesUpdated: "messagesUpdated",
		playernameReceived: "playernameReceived",
		playerUpdated: "playerUpdated",
		playersUpdated: "playersUpdated",
		promptsLoaded: "promptsLoaded",
		quitReceived: "quitReceived",
		stateUpdated: "stateUpdated",
		welcomeLoaded: "welcomeLoaded",
		winnersDecided: "winnersDecided",
		endView: "endView",
		newGameRequested: "newGameRequested",
		responseRegistered: "responseRegistered",
		responseSlipRegistered: "responseSlipRegistered",
		playerRegistered: "playerRegistered",
		responseGuessed: "responseGuessed"
	});
}
