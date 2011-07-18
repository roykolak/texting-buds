require('../lib/texting_buds');
require('../lib/store');
require('../lib/sender');

function message(person, body) {
  return {From:person, Body:body};
}

describe('TextingBuds', function() {
  var textingBuds, sender, store, person, stubbedQuery;

  beforeEach(function() {
    sender = new Sender({});
    store = new Store({});
    person = '8057698255';
    textingBuds = new TextingBuds(sender, store);

    stubbedQuery = function(query, result) {
      spyOn(store, query).andCallFake(function() {
        var args = this[query].mostRecentCall.args;
        var callback = args[args.length - 1];
        callback(result);
      });
    };
  });

  describe('#route', function() {
    describe('When the person has 3 blocks', function() {
      beforeEach(function() {
        stubbedQuery('getBlocks', 3);
      });

      it('sends the banned SMS to the person', function() {
        spyOn(textingBuds, 'banned');
        textingBuds.route(message(person, 'hello'));
        expect(textingBuds.banned).toHaveBeenCalledWith(person);
      });
    });

    describe('When the person has less than three blocks', function() {
      beforeEach(function() {
        stubbedQuery('getBlocks', 1);
      });

      describe('When the message contains #status', function() {
        it('calls to status', function() {
          spyOn(textingBuds, 'status');
          textingBuds.route(message(person, '#status'));
          expect(textingBuds.status).toHaveBeenCalledWith(person);
        });
      });

      describe('When the message contains #help', function() {
        it('calls to help', function() {
          spyOn(textingBuds, 'help');
          textingBuds.route(message(person, '#help'));
          expect(textingBuds.help).toHaveBeenCalledWith(person);
        });
      });

      describe('When the message contains #stop', function() {
        it('calls to stop', function() {
          spyOn(textingBuds, 'stop');
          textingBuds.route(message(person, '#stop'));
          expect(textingBuds.stop).toHaveBeenCalledWith(person);
        });
      });

      describe('When the message contains #next', function() {
        it('calls to next', function() {
          spyOn(textingBuds, 'next');
          textingBuds.route(message(person, '#next'));
          expect(textingBuds.next).toHaveBeenCalledWith(person);
        });
      });

      describe('When the message contains #block', function() {
        it('calls to block', function() {
          spyOn(textingBuds, 'block');
          textingBuds.route(message(person, '#block'));
          expect(textingBuds.block).toHaveBeenCalledWith(person);
        });
      });

      describe('When the message doesn\'t contain a command', function() {
        it('calls to relay', function() {
          var body = 'This is a message';
          spyOn(textingBuds, 'relay');
          textingBuds.route(message(person, body));
          expect(textingBuds.relay).toHaveBeenCalledWith(person, body);
        });
      });
    });
  });

  describe('#relay', function() {
    var buddy, message;

    beforeEach(function() {
      buddy = '333-777-9999';
      message = 'This is the message';
    });

    describe('When the person has a buddy', function() {
      beforeEach(function() {
        spyOn(sender, 'send');
        stubbedQuery('getAssignedBuddy', buddy);
      });

      it('relays the message to the person\'s buddy', function() {
        textingBuds.relay(person, message);
        expect(sender.send).toHaveBeenCalledWith(buddy, message);
      });
    });

    describe('When the person does not have a buddy', function() {
      beforeEach(function() {
        spyOn(sender, 'unassignedBuddySms');
        stubbedQuery('getAssignedBuddy', null);
      });

      it('sends the unassigned buddy SMS to the person', function() {
        textingBuds.relay(person, message);
        expect(sender.unassignedBuddySms).toHaveBeenCalledWith(person);
      });
    });
  });

  describe('#status', function() {
    var activeBuddies;

    beforeEach(function() {
      activeBuddies = ['345-444-555', '543-456-3456'];
      spyOn(sender, 'statusSms');
      stubbedQuery('getActiveBuddies', activeBuddies);
    });

    it('sends the status SMS to the person', function() {
      textingBuds.status(person);
      expect(sender.statusSms).toHaveBeenCalledWith(person, activeBuddies.length);
    });
  });

  describe('#next', function() {
    beforeEach(function() {
      spyOn(sender, 'rejectionSms');
      spyOn(sender, 'waitingForBuddySms');
    });

    describe('When the person has a buddy', function() {
      var buddy;

      beforeEach(function() {
        buddy = '222-333-4444';
        stubbedQuery('getAssignedBuddy', buddy);
        stubbedQuery('addBuddyWaiting', true);
        stubbedQuery('getBuddiesWaiting', []);
        stubbedQuery('unsetBuddiesProcess', true);
      });

      it('calls to unsetBuddiesProcess with both persons', function() {
        textingBuds.next(person);
        expect(store.unsetBuddiesProcess).toHaveBeenCalledWith(person, buddy, jasmine.any(Function));
      });

      it('sends the rejection SMS to their buddy', function() {
        textingBuds.next(person);
        expect(sender.rejectionSms).toHaveBeenCalledWith(buddy);
      });
    });

    describe('When the buddy queue is empty', function() {
      beforeEach(function() {
        stubbedQuery('getAssignedBuddy', null);
        stubbedQuery('getBuddiesWaiting', []);
        stubbedQuery('addBuddyWaiting', true);
      });

      it('sends the waiting for buddy SMS to the person', function() {
        textingBuds.next(person);
        expect(sender.waitingForBuddySms).toHaveBeenCalledWith(person);
      });
    });

    describe('When the buddy queue is not empty', function() {
      var buddy = '333-444-2222';

      beforeEach(function() {
        stubbedQuery('getAssignedBuddy', null);
        stubbedQuery('getPastBuddies', [buddy]);
      });

      describe('When the buddy queue does not contain new buddies', function() {
        beforeEach(function() {
          stubbedQuery('getBuddiesWaiting', [buddy]);
          stubbedQuery('addBuddyWaiting', true);
        });

        it('sends the waiting for buddy sms to the person', function() {
          textingBuds.next(person);
          expect(sender.waitingForBuddySms).toHaveBeenCalledWith(person);
        });
      });

      describe('When the buddy queue contains the person', function() {
        beforeEach(function() {
          stubbedQuery('getBuddiesWaiting', [person]);
        });

        it('sends the waiting for buddy sms to the person', function() {
          textingBuds.next(person);
          expect(sender.waitingForBuddySms).toHaveBeenCalledWith(person);
        });
      });

      describe('When the buddy queue does contain a new buddy', function() {
        var newBuddy, anotherNewBuddy;
        beforeEach(function() {
          newBuddy = '111-222-3333';
          anotherNewBuddy = '111-111-1111';

          spyOn(sender, 'meetYourNewBuddySms');
          stubbedQuery('getBuddiesWaiting', [buddy, newBuddy, anotherNewBuddy]);
          stubbedQuery('setBuddiesProcess', true);
        });

        it('calls to setBuddiesProcess with both persons', function() {
          textingBuds.next(person);
          expect(store.setBuddiesProcess).toHaveBeenCalledWith(person, newBuddy, jasmine.any(Function));
        });

        it('sends the meet your new buddy SMS to both parties', function() {
          textingBuds.next(person);
          expect(sender.meetYourNewBuddySms.argsForCall[0]).toEqual([person]);
          expect(sender.meetYourNewBuddySms.argsForCall[1]).toEqual([newBuddy]);
        });
      });
    });
  });

  describe('#block', function() {
    describe('When the person is not assigned to a buddy', function() {
      beforeEach(function() {
        spyOn(sender, 'unassignedBuddySms');
        stubbedQuery('getAssignedBuddy', null);
      });

      it('sends the unassigned buddy SMS to the person', function() {
        textingBuds.block(person);
        expect(sender.unassignedBuddySms).toHaveBeenCalledWith(person);
      });
    });

    describe('When the person is assigned to a buddy', function() {
      var buddy;

      beforeEach(function() {
        buddy = '444-333-222';
        spyOn(sender, 'blockerSms');
        spyOn(sender, 'blockeeSms');
        stubbedQuery('blockBuddy', true);
        stubbedQuery('getAssignedBuddy', buddy);
        stubbedQuery('unsetBuddiesProcess', true);
      });

      it('calls unsetBuddiesProcess with both persons', function() {
        textingBuds.block(person);
        expect(store.unsetBuddiesProcess).toHaveBeenCalledWith(person, buddy, jasmine.any(Function));
      });

      it('sends the blocker SMS to the person', function() {
        textingBuds.block(person);
        expect(sender.blockerSms).toHaveBeenCalledWith(person);
      });

      it('sends the blockee SMS to the buddy', function() {
        textingBuds.block(person);
        expect(sender.blockeeSms).toHaveBeenCalledWith(buddy);
      });
    });
  });

  describe('#banned', function() {
    it('sends the banned SMS to the person', function() {
      spyOn(sender, 'bannedSms');
      textingBuds.banned(person);
      expect(sender.bannedSms).toHaveBeenCalledWith(person);
    });
  });

  describe('#help', function() {
    it('sends the help SMS to the person', function() {
      spyOn(sender, 'helpSms');
      textingBuds.help(person);
      expect(sender.helpSms).toHaveBeenCalledWith(person);
    });
  });

  describe('#stop', function() {
    describe('When the person is not assigned to a buddy', function() {
      beforeEach(function() {
        spyOn(sender, 'unassignedBuddySms');
        stubbedQuery('getAssignedBuddy', null);
      });

      it('sends the unassigned buddy SMS to the person', function() {
        textingBuds.stop(person);
        expect(sender.unassignedBuddySms).toHaveBeenCalledWith(person);
      });
    });

    describe('When the person is assigned to a buddy', function() {
      var buddy;

      beforeEach(function() {
        buddy = '333-222-3333';
        spyOn(sender, 'rejectionSms');
        spyOn(sender, 'goodbyeSms');
        stubbedQuery('getAssignedBuddy', buddy);
        stubbedQuery('unsetBuddiesProcess', true);
      });

      it('calls to unsetBuddiesProcess with both persons', function() {
        textingBuds.stop(person);
        expect(store.unsetBuddiesProcess).toHaveBeenCalledWith(person, buddy, jasmine.any(Function));
      });

      it('sends the goodbye SMS to the person', function() {
        textingBuds.stop(person);
        expect(sender.goodbyeSms).toHaveBeenCalledWith(person);
      });

      it('sends the rejection SMS to the person', function() {
        textingBuds.stop(person);
        expect(sender.rejectionSms).toHaveBeenCalledWith(buddy);
      });
    });
  });
});
