export default ngModule => {
	ngModule.constant('gameEvents', {
		connected: "connected",
		playerActed: "playerActed",
		playerJoined: "playerJoined",
		playerIdReceived: "playerIdReceived",
		playerReconnected: "playerReconnected",
		updatePlayers: "updatePlayers",
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
		playersUpdated: "playersUpdated",
		promptsLoaded: "promptsLoaded",
		quitReceived: "quitReceived",
		stateUpdated: "stateUpdated",
		welcomeLoaded: "welcomeLoaded",
		winnersChosen: "winnersChosen",
		winnersDecided: "winnersDecided",
		endView: "endView",
		newGameRequested: "newGameRequested",
		responseRegistered: "responseRegistered",
		responseSlipRegistered: "responseSlipRegistered",
		playerRegistered: "playerRegistered",
		responseGuessed: "responseGuessed"
	});
}
