TextingBuds = function(sender, store) {
  return {
    route: function(params) {
      var person = params.From;
      var body = params.Body;

      var self = this;
      store.getBlocks(person, function(result) {
        if(result >= 3) {
          self.banned(person);
        } else {
          if(body.match(/#help/)) {
            self.help(person);
          } else if(body.match(/#stop/)) {
            self.stop(person);
          } else if(body.match(/#next/)) {
            self.next(person);
          } else if(body.match(/#block/)) {
            self.block(person);
          }
        }
      });
    },

    next: function(person) {
      store.getAssignedBuddy(person, function(buddy) {
        if(buddy !== null) {
          store.unsetBuddies(person, buddy, function() {
            store.addBuddyToPastBuddies(person, buddy, function() {
              sender.rejectionSms(buddy);
            });
          });
        }
        store.getBuddiesWaiting(function(buddies) {
          if(buddies.length === 0) {
            store.addBuddyWaiting(person, function() {
              sender.emptyQueueSms(person);
            });
          } else {
            store.popBuddyWaiting(function(buddy) {
              store.setBuddies(person, buddy, function() {
                sender.meetYourNewBuddySms(person);
                sender.meetYourNewBuddySms(buddy);
              });
            });
          }
        });
      });
    },

    stop: function(person) {
      store.getAssignedBuddy(person, function(buddy) {
        if(buddy === null) {
          sender.unassignedBuddySms(person);
        } else {
          store.unsetBuddies(person, buddy, function() {
            store.addBuddyToPastBuddies(person, buddy, function() {
              sender.goodbyeSms(person);
              sender.rejectionSms(buddy);
            });
          });
        }
      });
    },

    help: function(person) {
      sender.helpSms(person);
    },

    banned: function(person) {
      sender.bannedSms(person);
    },

    block: function(person) {
      store.getAssignedBuddy(person, function(buddy) {
        if(buddy === null) {
          sender.unassignedBuddySms(person);
        } else {
          store.unsetBuddies(person, buddy, function() {
            store.addBuddyToPastBuddies(person, buddy, function() {
              sender.blockerSms(person);
              sender.blockeeSms(buddy);
            });
          });
        }
      });
    }
  };
};
