export default class playerDisplay{
	constructor(){
		this.restrict = 'A';
		this.scope = {
			players: '=players'
		};
		this.templateUrl = 'src/directives/playerDisplay.html';
	}
}
