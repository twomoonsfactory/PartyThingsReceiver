export default class guessesSorted{
	constructor($log, $q, playerHandler, eventService, gameEvents, $timeout, messageProvider, messageNames){
		this.restrict =  'A';
		this.scope = {
			guesses: '=guesses'
		};
		this.log = $log;
		this.q = $q;
		this.playerHandler = playerHandler;
		this.eventService = eventService;
		this.gameEvents = gameEvents;
		this.timeout = $timeout;
		this.messageProvider = messageProvider;
		this.messageNames = messageNames;
	}
	link(scope, elem, attrs){
		let template;
	  let saveTemplate;
	  let responseTime = 3000;
	  let guessTime = 2000;
	  let correctGuessTime = 4000;
	  let baseGuessPoints = 10;
	  let unguessedPoints = 5;
	  let rightGuesses=scope.guesses.guessedRight;
	  let wrongGuesses=scope.guesses.guessedWrong;

    let wrongGuessResolve = (wrongGuesses, guessIndex) =>{
      if(wrongGuesses.length>0){
        this.q.when()
        .then(()=>{
          let deferred = this.q.defer();
          this.log.log("guess: " + wrongGuesses[guessIndex].response + " with " + wrongGuesses[guessIndex].guessers.length + " guessers");
          template = saveTemplate;
          template += this.messageProvider.getMessage({messageName: this.messageNames.guessedWrong, resp: wrongGuesses[guessIndex].response});
          elem.html(template);
          this.timeout(()=>{deferred.resolve()},responseTime);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = this.q.defer();
          wrongGuesserResolve(wrongGuesses[guessIndex].guessers, 0);
          this.timeout(()=>{deferred.resolve()},guessTime*wrongGuesses[guessIndex].guessers.length);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = this.q.defer();
            if(guessIndex + 1 !== wrongGuesses.length)
              return wrongGuessResolve(wrongGuesses, guessIndex + 1);
            else
              return deferred.promise;
        });
      }
      else{
        template += this.messageProvider.getMessage({messageName: this.messageNames.noWrongGuesses});
        this.log.log('no wrong guesses');
        elem.html(template);
        let deferred = this.q.defer();
        return deferred.promise;
      }
    }
    let wrongGuesserResolve = (wrongGuessers, guesserIndex) => {
      this.q.when()
      .then(()=>{
        let deferred = this.q.defer();
        this.log.log("guesser: " + wrongGuessers[guesserIndex].guesser);
        template += this.messageProvider.getMessage({messageName: this.messageNames.wrongGuess, pname: wrongGuessers[guesserIndex].guesser, pname2: wrongGuessers[guesserIndex].guessedWriter});
        elem.html(template);
        this.timeout(()=>{deferred.resolve();}, guessTime);
        return deferred.promise;
      })
      .then(()=>{
        let deferred = this.q.defer();
        if(guesserIndex + 1 !== wrongGuessers.length)
          return wrongGuesserResolve(wrongGuessers, guesserIndex + 1);
        else{
          this.timeout(()=>{deferred.resolve();}, (wrongGuessers.length-1) * responseTime);
          return deferred.promise;
        }
      })
      .then(()=>{
        let deferred = this.q.defer();
        return deferred.promise;
      });
    }
    let wrongGuessTime = ()=>{
      let time = 0;
      if(wrongGuesses.length>0){
        _.each(wrongGuesses, (wrongGuess) => {
         time += wrongGuess.guessers.length * responseTime;
        });
        time += wrongGuesses.length * guessTime;
      }
      time += responseTime;
      return time;
    }
    let rightGuessResolve = (rightGuesses, guessIndex) => {
      if(rightGuesses.length>0){
        this.q.when()
        .then(()=>{
          let deferred = this.q.defer();
          template = saveTemplate;
          template += this.messageProvider.getMessage({messageName: this.messageNames.guessedRight, resp: rightGuesses[guessIndex].response, pname: rightGuesses[guessIndex].writer});
          elem.html(template);
          this.log.log(rightGuesses[guessIndex].writer + ' was guessed by ' + rightGuesses[guessIndex].guessers.length + ' people');
          this.playerHandler.playerGuessed({playerId: rightGuesses[guessIndex].writerId});
          this.timeout(()=>{deferred.resolve()}, responseTime);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = this.q.defer();
          rightGuesserResolve(rightGuesses[guessIndex].guessers, 0);
          this.timeout(()=>{deferred.resolve()}, correctGuessTime*rightGuesses[guessIndex].guessers.length);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = this.q.defer();
          if(guessIndex + 1 !== rightGuesses.length)
            return rightGuessResolve(rightGuesses, guessIndex + 1);
          else
            return deferred.promise;
        });
      }
      else{
        template += this.messageProvider.getMessage({messageName: this.messageNames.noRightGuesses});
        this.log.log('no right guesses');
        elem.html(template);
        let deferred = this.q.defer();
        return deferred.promise;
      }
    }
    let rightGuesserResolve = (rightGuessers, guesserIndex) => {
      if(rightGuessers.length>0){
        this.q.when()
        .then(()=>{
          let deferred = this.q.defer();
          template += this.messageProvider.getMessage({messageName: this.messageNames.rightGuesser, pname: rightGuessers[guesserIndex].guesser});
          elem.html(template);
          this.log.log(rightGuessers[guesserIndex].guesser + ' guessed it');
          this.timeout(()=>{deferred.resolve()}, guessTime);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = this.q.defer();
          if(guesserIndex + 1 !== rightGuessers.length)
            rightGuesserResolve(rightGuessers, guesserIndex+1);
          else{
            this.timeout(()=>{deferred.resolve()}, (rightGuessers.length-1)*guessTime);
            return deferred.promise;
          }
        })
        .then(()=>{
          let deferred = this.q.defer();
          if(rightGuessers.length === guesserIndex +1){
            let points = Math.floor(baseGuessPoints/rightGuessers.length)
            if(rightGuessers.length === 1)
              template += this.messageProvider.getMessage({messageName: this.messageNames.oneRightGuesser, points: points});
            else {
              template += this.messageProvider.getMessage({messageName: this.messageNames.multiRightGuessers, points: points});
            }
            elem.html(template);
            _.each(rightGuessers, (rightGuesser) => {
              this.playerHandler.assignPoints({playerId: rightGuesser.guesserId, points: points});
            });
            this.timeout(()=>{deferred.resolve()}, guessTime*rightGuesses.length);
            return deferred.promise;
          }
          else {
            return deferred.promise;
          }
        });
      }
      else {
        let deferred = this.q.defer();
        return referred.promise;
      }
    }
    let rightGuessTime = ()=>{
      let time = 0;
      if(rightGuesses.length>0){
        _.each(rightGuesses, (rightGuess) => {
          time += rightGuess.guessers.length * responseTime;
        });
        time += rightGuesses.length * correctGuessTime;
      }
      time += responseTime;
      return time;
    }
    let unguessedResolve = (unguessed, unguessedIndex) => {
      if(unguessed.length>1){
        this.q.when()
        .then(()=>{
          let deferred = this.q.defer();
          template += this.messageProvider.getMessage({messageName: this.messageNames.unguessedPlayer, pname: unguessed[unguessedIndex].playerName, points:  unguessedPoints});
          this.log.log(unguessed[unguessedIndex].playerName + ' unguessed');
          elem.html(template);
          this.playerHandler.assignPoints({playerId: unguessed[unguessedIndex].playerId, points: unguessedPoints});
          this.timeout(()=>{deferred.resolve();}, responseTime);
          return deferred.promise;
        })
        .then(()=>{
          let deferred = this.q.defer();
          if(unguessedIndex +1 !== unguessed.length)
            return unguessedResolve(unguessed, unguessedIndex + 1);
          else {
            return deferred.promise;
          }
        });
      }
      else if(unguessed.length === 1){
        this.q.when()
        .then(()=>{
          let deferred = this.q.defer();
          template += this.messageProvider.getMessage({messageName: this.messageNames.oneUnguessedPlayer, pname: unguessed[0].playerName, points: unguessedPoints * 2});
          this.log.log(unguessed[0].playerName + ' only unguessed');
          this.playerHandler.assignPoints({playerId: unguessed[0].playerId, points: unguessedPoints * 2});
          elem.html(template);
          this.timeout(()=>{deferred.resolve();},responseTime);
          return deferred.promise;
        });
      }
      else{
        this.q.when()
        .then(()=>{
          let deferred = this.q.defer();
          template += this.messageProvider.getMessage({messageName: this.messageNames.noUnguessed});
          this.log.log('no unguessed');
          elem.html(template);
          this.timeout(()=>{deferred.resolve();},responseTime);
          return deferred.promise;
        });
      }
    }
    let unguessedTime = (unguessed) => {
      let time = 0;
      if(unguessed.length>0)
        time += unguessed.length*responseTime;
      time += responseTime;
      return time;
    }
    //core logic for the guess results render
    this.q.when()
    .then(()=>{
      let deferred = this.q.defer();
      template = this.messageProvider.getMessage({messageName: this.messageNames.wrongDisplay});
      elem.html(template);
      saveTemplate = template;
      this.timeout(()=>{deferred.resolve();},responseTime);
      return deferred.promise;
    })
    .then(()=>{
      let deferred = this.q.defer();
      this.timeout(()=>{deferred.resolve();},wrongGuessTime());
      wrongGuessResolve(wrongGuesses,0);
      return deferred.promise;
    })
    .then(()=>{
      let deferred = this.q.defer();
      template = this.messageProvider.getMessage({messageName: this.messageNames.rightDisplay});
      saveTemplate = template;
      elem.html(template);
      this.timeout(()=>{deferred.resolve();},responseTime);
      return deferred.promise;
    })
    .then(()=>{
      let deferred = this.q.defer();
      this.timeout(()=>{deferred.resolve();},rightGuessTime());
      rightGuessResolve(rightGuesses,0);
      return deferred.promise;
    })
    .then(()=>{
      let deferred = this.q.defer();
      template = this.messageProvider.getMessage({messageName: this.messageNames.unguessedDisplay});
      elem.html(template);
      this.timeout(()=>{deferred.resolve();},responseTime);
      return deferred.promise;
    })
    .then(()=>{
      let deferred = this.q.defer();
      let unguessed = this.playerHandler.getElegiblePlayers();
      this.timeout(()=>{deferred.resolve();}, unguessedTime(unguessed));
      unguessedResolve(unguessed, 0);
      return deferred.promise;
    })
    .then(()=>{
      let deferred = this.q.defer();
      template = this.playerHandler.unguessedPlayers() ? this.messageProvider.getMessage({messageName: this.messageNames.moreGuessing}) : this.messageProvider.getMessage({messageName: this.messageNames.allGuessed});
      elem.html(template);
      this.timeout(()=>{deferred.resolve();}, correctGuessTime);
      return deferred.promise;
    })
    .then(()=>{
      this.eventService.publish(this.gameEvents.guessesResolved, "");
    });
  }
}
guessesSorted.$inject = ['$log', '$q', 'playerHandler', 'eventService', 'gameEvents', '$timeout', 'messageProvider', 'messageNames'];
