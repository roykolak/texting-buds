Sender = function(sms) {
  return {
    bannedSms: function(number) {
      sms(number, this.messages.banned);
    },

    unassignedBuddySms: function(number) {
      sms(number, this.messages.unassignedBuddy);
    },

    waitingForBuddySms: function(number) {
      sms(number, this.messages.waitingForBuddy);
    },

    meetYourNewBuddySms: function(number) {
      sms(number, this.messages.meetYourNewBuddy);
    },

    helpSms: function(number) {
      sms(number, this.messages.help);
    },

    rejectionSms: function(number) {
      sms(number, this.messages.rejection);
    },

    goodbyeSms: function(number) {
      sms(number, this.messages.goodbye);
    },

    blockerSms: function(number) {
      sms(number, this.messages.blocker);
    },

    blockeeSms: function(number) {
      sms(number, this.messages.blockee);
    },

    emptyQueueSms: function(number) {
      sms(number, this.messages.emptyQueue);
    },

    messages: {
      unassignedBuddy: "Text #next to get a random buddy.",
      waitingForBuddy: "I'm tracking down a random buddy for you, I'll let you know when I found one.",
      meetYourNewBuddy: "Meet your new texting buddy! Start texting by replying to this message. Text #stop to end it.",
      emptyQueue: "no buddies right, now",
      rejection: "Looks like your buddy wanted to stop chatting. Text #next for a new buddy.",
      help: "this is the help message",
      goodbye: "No more buddies for you. Text #next to start again",
      blocker: "Sorry that you had a bad experience.",
      blockee: "You have been blocked",
      banned: "You are banned, sorry"
    }
  };
}
