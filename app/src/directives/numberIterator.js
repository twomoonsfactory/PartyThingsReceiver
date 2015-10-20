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

        let highNumberColor = '#00CC00';
        let midNumberColor = '#999900';
        let lowNumberColor = '#FF0000';

        let firstTimeThrough = true;
        //kicked off by watch
        scope.startIteration = ()=>{
          scope.iterate(scope.numberToAdd);
          let firstTimeThrough = true;
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
              $timeout(()=>{deferred.resolve();},firstTimeThrough?1000:50);
              return deferred.promise;
            })
            .then(()=>{
              firstTimeThrough = false;
              scope.baseNumber++;
              scope.iterate(number-1);
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
