export default ngModule => {
	ngModule.constant('gameStates', {
		WaitingForFirstPlayer: "WaitingForFirstPlayer",
		WaitingForStart: "WaitingForStart",
		WaitingForReady: "WaitingForReady",
		ReadyToStart: "ReadyToStart",
		PromptChosen: "PromptChosen",
		ResponsesReceived: "ResponsesReceived",
		GuessesDisplayed: "GuessesDisplayed",
		RoundEnd: "RoundEnd",
		GameEnd: "GameEnd"
	});
}
