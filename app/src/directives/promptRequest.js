module.exports = function(){
		return {
			restrict: 'A',
			scope: {
        display: '='
      },
			template: '<h3>The time has come to pick a prompt!</h3><h4>Vote for one of the following...</h4><p ng-repeat="prompt in display">{{prompt}}</p>'
		};
	};
