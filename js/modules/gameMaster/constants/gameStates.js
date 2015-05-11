angular.module('gameMaster')
	.constant('gameStates', {
		WaitingForStart: "WaitingForStart",
		ReadyToStart: "ReadyToStart",
		WaitingForReady: "WaitingForReady",
		PlayersReady: "PlayersReady",
		PromptChosen: "PromptChosen",
		ThingsReceived: "ThingsReceived",
		RoundEnd: "RoundEnd",
		GameEnd: "GameEnd"
	});