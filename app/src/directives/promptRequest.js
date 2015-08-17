export default class promtpRequest{
	constructor(){
		this.restrict = 'A';
		this.scope = {
			prompts: '=prompts'
		};
		this.templateUrl = 'src/directives/promptRequest.html';
	}
}
