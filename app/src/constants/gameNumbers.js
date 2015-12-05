export default ngModule => {
	ngModule.constant('gameNumbers', {
		guessScore:10,
    unguessedScore:5,
    winningScore:100,
    minimumPlayers:1
	});
}
