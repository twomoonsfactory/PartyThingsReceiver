export default class gameStates{
	constructor (){
		let gameStates = {
			WaitingForStart: "WaitingForStart",
			WaitingForReady: "WaitingForReady",
			ReadyToStart: "ReadyToStart",
			PromptChosen: "PromptChosen",
			ResponsesReceived: "ResponsesReceived",
			RoundEnd: "RoundEnd",
			GameEnd: "GameEnd"
		};
		return gameStates
	}
}
