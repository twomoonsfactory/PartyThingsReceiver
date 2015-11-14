export default ngModule => {
  class fakePlayerProvider{
    constructor(){
      this.playerList = [
        {senderId:52, playerName:"Harry Dresden"},
  			{senderId:15, playerName:"Rose"},
  			{senderId:5122, playerName:"Milly"},
  			{senderId:972343, playerName:"Geraldine"},
  			{senderId:9872343, playerName:"Peter Parker"},
  			{senderId:125, playerName:"Joe"},
  			{senderId:157, playerName:"Billy"},
  			{senderId:255234, playerName:"Alan Parsons"},
  			{senderId:1547, playerName:"Mary Jane"},
  			{senderId:572, playerName:"Steve Rodgers"},
  			{senderId:998, playerName:"Nick Fury"},
  			{senderId:25234, playerName:"Mikey"},
  			{senderId:997, playerName:"Professor Xavier"},
  			{senderId:996, playerName:"Derpina"},
  			{senderId:995, playerName:"Derp"},
        {senderId:522, playerName:"Fran"},
				{senderId:152, playerName:"Rosalina"},
				{senderId:2215234, playerName:"Sir Alec Guiness"},
				{senderId:15147, playerName:"Billybob Thornton"},
        {senderId:31908, playerName:"Someone Else"}
      ];
      this.gameName = "\"Red Vs Blue\"";
      this.senderIdIndex = 0;
      this.playerNameIndex = 0;
    }

    getJoiningPlayerInitial(){
      let currentSenderId = this.playerList[this.senderIdIndex].senderId;
      this.senderIdIndex++;
      return {senderId: currentSenderId};
    }

    getJoiningPlayerDetail(){
      let currentPlayer = this.playerList[this.playerNameIndex];
      let currentMessage = {senderId: currentPlayer.senderId, message: {playerName: currentPlayer.playerName}};
      if(this.playerNameIndex===0) currentMessage.message.gameName = this.gameName;
      this.playerNameIndex++;
      return currentMessage;
    }
  }
  fakePlayerProvider.$inject = [];
  ngModule.service('fakePlayerProvider', fakePlayerProvider);
}
