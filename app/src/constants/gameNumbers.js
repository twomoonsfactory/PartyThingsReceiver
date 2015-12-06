export default ngModule => {
	ngModule.constant('gameNumbers', {
		guessScore:10,
    unguessedScore:5,
    winningScore:50,
    minimumPlayers:2
	});
}
