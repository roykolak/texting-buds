Sender = function(client) {
  return {
    send: function(number, message) {
      client.sendSms(number, message, null, function(){});
    },
    statusSms: function(number, buddies) {
      this.send(number, buddies + this.messages.status);
    },
    bannedSms: function(number) {
      this.send(number, this.messages.banned);
    },

    unassignedBuddySms: function(number) {
      this.send(number, this.messages.unassignedBuddy);
    },

    waitingForBuddySms: function(number) {
      this.send(number, this.messages.waitingForBuddy);
    },

    meetYourNewBuddySms: function(number) {
      this.send(number, this.messages.meetYourNewBuddy);
    },

    helpSms: function(number) {
      this.send(number, this.messages.help);
    },

    rejectionSms: function(number) {
      this.send(number, this.messages.rejection);
    },

    goodbyeSms: function(number) {
      this.send(number, this.messages.goodbye);
    },

    blockerSms: function(number) {
      this.send(number, this.messages.blocker);
    },

    blockeeSms: function(number) {
      this.send(number, this.messages.blockee);
    },

    messages: {
      status: " buddies paired at the moment",
      unassignedBuddy: "Text #next to get a random buddy.",
      waitingForBuddy: "Tracking down a random buddy for you, you'll be texted when one is found.",
      meetYourNewBuddy: "Meet your new texting buddy! Start texting by replying to this message.",
      rejection: "Looks like your buddy wanted to stop chatting. Text #next for a new buddy.",
      help: "this is the help message",
      goodbye: "Sorry to see you go. If you ever want to start again, text #next.",
      blocker: "Thanks for blocking bad buddies, you are helping make this experience better! Text #next for a new buddy.",
      blockee: "You have been blocked, Make sure you are being a good buddy. Text #next for a new buddy",
      banned: "You are banned."
    }
  };
};
