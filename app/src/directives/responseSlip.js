export default ngModule =>{
	ngModule.directive('responseSlip', ['gameEvents', '$rootScope', (gameEvents, $rootScope)=>{
		return {
			restrict: 'A',
      scope: {
        response: '=responseSlip'
      },
			template: '{{response.response}}',
      link: (scope, elem, attrs) =>{
				scope.mark = ()=>{
        	elem.addClass('guessedResponse inactive');
        }
        $rootScope.$emit(gameEvents.responseSlipRegistered, scope);
      }
		}
	}])
}
