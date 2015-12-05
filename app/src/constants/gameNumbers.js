export default ngModule => {
	ngModule.constant('gameNumbers', {
		guessScore:10,
    unguessedScore:5,
    winningScore:20,
    minimumPlayers:2
	});
}
