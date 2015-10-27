export default ngModule => {
	ngModule.constant('gameStates', {
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
