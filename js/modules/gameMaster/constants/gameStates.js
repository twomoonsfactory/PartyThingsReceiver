angular.module('gameMaster')
	.constant('gameStates', {
		WaitingForStart: "WaitingForStart",
		ReadyToStart: "ReadyToStart",
		WaitingForReady: "WaitingForReady",
		PlayersReady: "PlayersReady",
		PromptChosen: "PromptChosen",
		ResponsesReceived: "ResponsesReceived",
		RoundEnd: "RoundEnd",
		GameEnd: "GameEnd"
	});