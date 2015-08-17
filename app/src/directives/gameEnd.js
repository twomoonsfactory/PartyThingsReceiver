export default class gameEnd{
	constructor(){
		this.restrict = 'A';
		this.scope = {
			winners: '=winners'
		};
		this.templateUrl = 'src/directives/gameEnd.html';
	}
}
