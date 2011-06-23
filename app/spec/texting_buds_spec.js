require('../lib/texting_buds');
require('../lib/store');
require('../lib/sender');

function message(number, body) {
  return {From:number, Body:body};
}

describe('TextingBuds', function() {
  var textingBuds, sender, store, number, stubbedQuery;

  beforeEach(function() {
    sender = new Sender({});
    store = new Store({});
    number = '8057698255';
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
        textingBuds.route(message(number, 'hello'));
        expect(textingBuds.banned).toHaveBeenCalledWith(number);
      });
    });

    describe('When the person has less than three blocks', function() {
      beforeEach(function() {
        stubbedQuery('getBlocks', 1);
      });

      describe('When the message contains #help', function() {
        it('calls to help', function() {
          spyOn(textingBuds, 'help');
          textingBuds.route(message(number, '#help'));
          expect(textingBuds.help).toHaveBeenCalledWith(number);
        });
      });

      describe('When the message contains #stop', function() {
        it('calls to stop', function() {
          spyOn(textingBuds, 'stop');
          textingBuds.route(message(number, '#stop'));
          expect(textingBuds.stop).toHaveBeenCalledWith(number);
        });
      });

      describe('When the message contains #next', function() {
        it('calls to next', function() {
          spyOn(textingBuds, 'next');
          textingBuds.route(message(number, '#next'));
          expect(textingBuds.next).toHaveBeenCalledWith(number);
        });
      });

      describe('When the message contains #block', function() {
        it('calls to block', function() {
          spyOn(textingBuds, 'block');
          textingBuds.route(message(number, '#block'));
          expect(textingBuds.block).toHaveBeenCalledWith(number);
        });
      });
    });
  });

  describe('#next', function() {
    beforeEach(function() {
      spyOn(sender, 'rejectionSms');
      spyOn(sender, 'emptyQueueSms');
    });

    describe('When the person has a buddy', function() {
      var buddy;

      beforeEach(function() {
        buddy = '222-333-4444';
        stubbedQuery('getAssignedBuddy', buddy);
        stubbedQuery('unsetBuddies', true);
        stubbedQuery('addBuddyWaiting', true);
        stubbedQuery('getBuddiesWaiting', []);
        stubbedQuery('addBuddyToPastBuddies', true);
      });

      it('sends the rejection SMS to their buddy', function() {
        textingBuds.next(number);
        expect(sender.rejectionSms).toHaveBeenCalledWith(buddy);
      });
    });

    describe('When the buddy queue is empty', function() {
      beforeEach(function() {
        stubbedQuery('getAssignedBuddy', null);
        stubbedQuery('getBuddiesWaiting', []);
        stubbedQuery('addBuddyWaiting', true);
      });

      it('sends the empty queue SMS to the person', function() {
        textingBuds.next(number);
        expect(sender.emptyQueueSms).toHaveBeenCalledWith(number);
      });
    });

    describe('When the buddy queue is not empty', function() {
      var buddy = '333-444-2222';

      beforeEach(function() {
        spyOn(sender, 'meetYourNewBuddySms');
        stubbedQuery('getAssignedBuddy', null);
        stubbedQuery('getBuddiesWaiting', [buddy, '111-222-333']);
        stubbedQuery('popBuddyWaiting', buddy);
        stubbedQuery('setBuddies', true);
      });

      it('sends the meet your new buddy SMS to both parties', function() {
        textingBuds.next(number);
        expect(sender.meetYourNewBuddySms.argsForCall[0]).toEqual([number]);
        expect(sender.meetYourNewBuddySms.argsForCall[1]).toEqual([buddy]);
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
        textingBuds.block(number);
        expect(sender.unassignedBuddySms).toHaveBeenCalledWith(number);
      });
    });

    describe('When the person is assigned to a buddy', function() {
      var buddy;

      beforeEach(function() {
        buddy = '444-333-222';
        spyOn(sender, 'blockerSms');
        spyOn(sender, 'blockeeSms');
        stubbedQuery('getAssignedBuddy', buddy);
        stubbedQuery('unsetBuddies', true);
        stubbedQuery('addBuddyToPastBuddies', true);
      });

      it('sends the blocker SMS to the person', function() {
        textingBuds.block(number);
        expect(sender.blockerSms).toHaveBeenCalledWith(number);
      });

      it('sends the blockee SMS to the buddy', function() {
        textingBuds.block(number);
        expect(sender.blockeeSms).toHaveBeenCalledWith(buddy);
      });
    });
  });

  describe('#banned', function() {
    it('sends the banned SMS to the person', function() {
      spyOn(sender, 'bannedSms');
      textingBuds.banned(number);
      expect(sender.bannedSms).toHaveBeenCalledWith(number);
    });
  });

  describe('#help', function() {
    it('sends the help SMS to the person', function() {
      spyOn(sender, 'helpSms');
      textingBuds.help(number);
      expect(sender.helpSms).toHaveBeenCalledWith(number);
    });
  });

  describe('#stop', function() {
    describe('When the person is not assigned to a buddy', function() {
      beforeEach(function() {
        spyOn(sender, 'unassignedBuddySms');
        stubbedQuery('getAssignedBuddy', null);
      });

      it('sends the unassigned buddy SMS to the person', function() {
        textingBuds.stop(number);
        expect(sender.unassignedBuddySms).toHaveBeenCalledWith(number);
      });
    });

    describe('When the person is assigned to a buddy', function() {
      var buddy;

      beforeEach(function() {
        buddy = '333-222-3333';
        spyOn(sender, 'rejectionSms');
        spyOn(sender, 'goodbyeSms');
        stubbedQuery('getAssignedBuddy', buddy);
        stubbedQuery('unsetBuddies', true);
        stubbedQuery('addBuddyToPastBuddies', true);
      });

      it('sends the goodbye SMS to the person', function() {
        textingBuds.stop(number);
        expect(sender.goodbyeSms).toHaveBeenCalledWith(number);
      });

      it('sends the rejection SMS to the person', function() {
        textingBuds.stop(number);
        expect(sender.rejectionSms).toHaveBeenCalledWith(buddy);
      });
    });
  });
});
