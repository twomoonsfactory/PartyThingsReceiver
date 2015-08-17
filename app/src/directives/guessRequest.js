export default class guessRequest{
	constructor(){
		this.restrict = 'A';
		this.scope = {
			responses: '=responses'
		};
		this.templateUrl = 'src/directives/guessRequest.html';
	}
}
