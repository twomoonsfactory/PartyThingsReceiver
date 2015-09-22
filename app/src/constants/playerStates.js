export default ngModule => {
	ngModule.constant('playerStates', {
		incoming: "incoming",
		ready: "ready",
		quit: "quit",
		standingBy: "standingBy",
		waiting: "waiting",
		readyRequested: "readyRequested",
		voting: "voting",
		writing: "writing",
		guessing: "guessing"
	});
}
