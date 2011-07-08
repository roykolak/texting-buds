TextingBuds = function(sender, store) {

  function findNewBuddy(pastBuddies, buddies) {
    var foundBuddy;
    buddies.forEach(function(buddy) {
      if(!foundBuddy) {
        if(pastBuddies.indexOf(buddy) == -1) {
          foundBuddy = buddy;
        }
      }
    });
    return foundBuddy;
  }

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
          } else {
            self.relay(person, body);
          }
        }
      });
    },

    relay: function(person, message) {
      store.getAssignedBuddy(person, function(buddy) {
        if(buddy) {
          sender.send(buddy, message);
        } else {
          sender.unassignedBuddySms(person);
        }
      });
    },

    next: function(person) {
      store.getAssignedBuddy(person, function(buddy) {
        if(buddy !== null) {
          store.unsetBuddiesProcess(person, buddy, function() {
            sender.rejectionSms(buddy);
          });
        }
        store.getBuddiesWaiting(function(buddies) {
          if(buddies.length === 0) {
            store.addBuddyWaiting(person, function() {
              sender.waitingForBuddySms(person);
            });
          } else {
            if(buddies.indexOf(person) != -1) {
              sender.waitingForBuddySms(person);
            } else {
              store.getPastBuddies(person, function(pastBuddies) {
                var newBuddy = findNewBuddy(pastBuddies, buddies);
                if(newBuddy) {
                  store.setBuddiesProcess(person, newBuddy, function() {
                    sender.meetYourNewBuddySms(person);
                    sender.meetYourNewBuddySms(newBuddy);
                  });
                } else {
                  store.addBuddyWaiting(person, function() {
                    sender.waitingForBuddySms(person);
                  });
                }
              });
            }
          }
        });
      });
    },

    stop: function(person) {
      store.getAssignedBuddy(person, function(buddy) {
        if(buddy === null) {
          sender.unassignedBuddySms(person);
        } else {
          store.unsetBuddiesProcess(person, buddy, function() {
            sender.goodbyeSms(person);
            sender.rejectionSms(buddy);
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
          store.blockBuddy(buddy, function() {
            store.unsetBuddiesProcess(person, buddy, function() {
              sender.blockerSms(person);
              sender.blockeeSms(buddy);
            });
          });
        }
      });
    }
  };
};
