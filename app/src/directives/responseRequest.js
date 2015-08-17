export default class responseRequest{
	constructor(){
		this.restrict = 'A';
		this.scope = {
			prompt: '=prompt'
		};
		this.templateUrl = 'src/directives/responseRequest.html';
	}
}
