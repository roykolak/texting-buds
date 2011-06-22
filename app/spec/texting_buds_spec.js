require('../lib/texting_buds');
require('../lib/store');
require('../lib/sender');

function message(number, body) {
  return {From:number, Body:body};
}

describe('TextingBuds', function() {
  var textingBuds, sender, store, number, stubbedQuery, pause;

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
    pause = function(queryCount) {
      waitsFor(function() {
        return store.finishedQuery(queryCount);
      }, 'query never finished', 2000);
    };
  });

  describe('#route', function() {
    describe('When the person has 3 blocks', function() {
      beforeEach(function() {
       store.setBlocks(number, 3, function(){});
      });

      it('sends the banned SMS to the person', function() {
        spyOn(textingBuds, 'banned');
        textingBuds.route(message(number, 'hello'));
        pause();

        runs(function() {
          expect(textingBuds.banned).toHaveBeenCalledWith(number);
        });
      });
    });

    describe('When the person has less than three blocks', function() {
      beforeEach(function() {
        store.setBlocks(number, 1, function(){});
      });

      describe('When the message contains #help', function() {
        it('calls to help', function() {
          spyOn(textingBuds, 'help');
          textingBuds.route(message(number, '#help'));
          pause();

          runs(function() {
            expect(textingBuds.help).toHaveBeenCalledWith(number);
          });
        });
      });

      describe('When the message contains #stop', function() {
        it('calls to stop', function() {
          spyOn(textingBuds, 'stop');
          textingBuds.route(message(number, '#stop'));
          pause();

          runs(function() {
            expect(textingBuds.stop).toHaveBeenCalledWith(number);
          });
        });
      });

      describe('When the message contains #next', function() {
        it('calls to next', function() {
          spyOn(textingBuds, 'next');
          textingBuds.route(message(number, '#next'));
          pause();

          runs(function() {
            expect(textingBuds.next).toHaveBeenCalledWith(number);
          });
        });
      });

      describe('When the message contains #block', function() {
        it('calls to block', function() {
          spyOn(textingBuds, 'block');
          textingBuds.route(message(number, '#block'));
          pause();

          runs(function() {
            expect(textingBuds.block).toHaveBeenCalledWith(number);
          });
        });
      });
    });
  });

  describe('#next', function() {
    beforeEach(function() {
      spyOn(sender, 'emptyQueueSms');
    });

    describe('When the person does not have a buddy', function() {
      beforeEach(function() {
        store.unsetBuddies(number, null, function(){});
        waits(100);
      });

      describe('When the buddy queue is empty', function() {
        beforeEach(function() {
          store.clearBuddyQueue(function(){});
          waits(100);
          store.resetQueryCount();
        });

        it('sends the empty queue SMS to the person', function() {
          runs(function() {
            console.log('start');
            textingBuds.next(number);
          });
          pause(2);

          runs(function() {
            expect(sender.emptyQueueSms).toHaveBeenCalledWith(number);
            console.log('end');
          });
        });
      });
    });

    describe('When the person does have a buddy', function() {
      var buddy;

      beforeEach(function() {
        buddy = '222-333-4444';
        store.setBuddies(number, buddy, function(){});
        spyOn(sender, 'rejectionSms');
        waits(100);
        store.resetQueryCount();
      });

      it('sends the rejection SMS to their buddy', function() {
        console.log('start');
        textingBuds.next(number);
        pause(2);

        expect(sender.rejectionSms).toHaveBeenCalledWith(buddy);
        console.log('end');
      });
    });
  });

  describe('#block', function() {
    describe('When the person is not assigned to a buddy', function() {
      beforeEach(function() {
        store.unsetBuddies(number, null, function(){});
        waits(100);
      });

      it('sends the unassigned buddy SMS to the person', function() {
        spyOn(sender, 'unassignedBuddySms');
        textingBuds.block(number);
        pause();

        runs(function() {
          expect(sender.unassignedBuddySms).toHaveBeenCalledWith(number);
        });
      });
    });

    describe('When the person is assigned to a buddy', function() {
      var buddy;

      beforeEach(function() {
        buddy = '444-333-222';
        store.setBuddies(number, buddy, function(){});
        console.log('buddies set');
        spyOn(sender, 'blockerSms');
        spyOn(sender, 'blockeeSms');
        store.resetQueryCount();
      });

      it('sends the blocker SMS to the person', function() {
        console.log('block');
        textingBuds.block(number);
        pause(3);

        runs(function() {
          expect(sender.blockerSms).toHaveBeenCalledWith(number);
        });
      });

      it('sends the blockee SMS to the buddy', function() {
        textingBuds.block(number);
        pause(3);

        runs(function() {
          expect(sender.blockeeSms).toHaveBeenCalledWith(buddy);
        });
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
        store.unsetBuddies(number, null, function(){});
        waits(1000);
      });

      it('sends the unassigned buddy SMS to the person', function() {
        spyOn(sender, 'unassignedBuddySms');
        textingBuds.stop(number);
        pause();

        runs(function() {
          expect(sender.unassignedBuddySms).toHaveBeenCalledWith(number);
        });
      });
    });

    describe('When the person is assigned to a buddy', function() {
      var buddy;

      beforeEach(function() {
        buddy = '333-222-3333';
        store.setBuddies(number, buddy, function(){});
        spyOn(sender, 'rejectionSms');
        spyOn(sender, 'goodbyeSms');
        store.resetQueryCount();
      });

      it('sends the goodbye SMS to the person', function() {
        textingBuds.stop(number);
        pause(3);

        runs(function() {
          expect(sender.goodbyeSms).toHaveBeenCalledWith(number);
        });
      });

      it('sends the rejection SMS to the person', function() {
        textingBuds.stop(number);
        pause(3);

        runs(function() {
          expect(sender.rejectionSms).toHaveBeenCalledWith(buddy);
        });
      });
    });
  });
});
