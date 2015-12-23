export default ngModule =>{
	ngModule.directive('numberIterator', ['$q', '$timeout', ($q, $timeout)=>{
		return {
			restrict: 'A',
      scope: {
        baseNumber: '=',
        numberToAdd: '=numberIterator'
      },
      template: '{{textToDisplay}}',
      link: (scope, elem, attrs) =>{
        scope.textToDisplay = "";

        let highNumber = 5;
        let midNumber = 3;

        let highNumberColor = '#8BC34A';
        let midNumberColor = '#FFC400';
        let lowNumberColor = '#D32F2F';

				let stepAnimateOn = false;

        let firstTimeThrough = true;
        //kicked off by watch
        scope.startIteration = ()=>{
          scope.iterate(scope.numberToAdd);
          firstTimeThrough = true;
        }
        //iterates through increasing the baseNumber while steppig down the numberToAdd
        scope.iterate = (number)=>{
          if(number>0){
            $q.when()
            .then(()=>{
              let deferred = $q.defer();
              if(number > highNumber){
                elem.css({'color':highNumberColor,
                          'font-weight':'bolder'});
              }
              else if (number > midNumber){
                elem.css({'color':midNumberColor,
                          'font-weight':'bold'});
              }
              else{
                elem.css({'color':lowNumberColor,
                          'font-weight':'normal'});
              }
              scope.textToDisplay = "+" + number;
              $timeout(()=>{deferred.resolve();},firstTimeThrough?2000:50);
              return deferred.promise;
            })
            .then(()=>{
              firstTimeThrough = false;
              scope.baseNumber += stepAnimateOn?1:number;
              scope.iterate(stepAnimateOn?number-1:0);
            });
          }
          else{
            scope.textToDisplay = "";
            scope.numberToAdd = 0;
          }
        }

        scope.$watch('numberToAdd', scope.startIteration);
      }
		}
	}])
}
