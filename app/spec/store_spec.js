require('../lib/store');

describe('Store', function() {
  var store;

  beforeEach(function() {
    store = new Store({});
  });

  describe('#buddyKey', function() {
    var number;

    beforeEach(function() {
      number = '805-769-8255';
    });

    it('returns the buddy key for the passed number', function() {
      expect(Store.buddyKey(number)).toEqual('phone:' + number + ':buddy');
    });

    it('returns the blocks key for the passed number', function() {
      expect(Store.blocksKey(number)).toEqual('phone:' + number + ':blocks');
    });

    it('returns the past buddies key for the passed number', function() {
      expect(Store.pastBuddiesKey(number)).toEqual('phone:' + number + ':buddys');
    });
  });

  describe('queries', function() {
    var results, buddy1, buddy2, callback;

    beforeEach(function() {
      callback = jasmine.createSpy('callback');
      results = 'fake results';
      buddy1 = '805-769-8255';
      buddy2 = '847-639-0863';

      spyOn(store, 'run').andCallFake(function(method, params, callback) {
        callback(results);
      });
    });

    describe('#getBlocks', function() {
      it('returns the number of blocks the user has', function() {
        store.getBlocks(buddy1, callback);
        expect(store.run).toHaveBeenCalledWith('get', [Store.blocksKey(buddy1)], jasmine.any(Function));
      });

      it('calls the passed callback with the results', function() {
        store.getBlocks(buddy1, callback);
        expect(callback).toHaveBeenCalledWith(results);
      });
    });

    describe('#getBuddiesWaiting', function() {
      it('returns all the buddies in the waiting queue', function() {
        store.getBuddiesWaiting(callback);
        expect(store.run).toHaveBeenCalledWith('lrange', ['buddies', 0, -1], jasmine.any(Function));
      });

      it('calls the passed callback with the results', function() {
        store.getBuddiesWaiting(callback);
        expect(callback).toHaveBeenCalledWith(results);
      });
    });

    describe('#getPastBuddies', function() {
      it('returns all the person\'s past buddies', function() {
        store.getPastBuddies(buddy1, callback);
        expect(store.run).toHaveBeenCalledWith('lrange', [Store.pastBuddiesKey(buddy1), 0, -1], jasmine.any(Function));
      });
    });

    describe('#addBuddyToPastBuddies', function() {
      it('pushs the buddy onto the past buddys for the person', function() {
        store.addBuddyToPastBuddies(buddy1, buddy2, callback);
        expect(store.run).toHaveBeenCalledWith('rpush', [Store.pastBuddiesKey(buddy1), buddy2], jasmine.any(Function));
      });
    });

    describe('#removeBuddyWaiting', function() {
      it('removes the buddy passed from the waiting buddies queue', function() {
        store.removeBuddyWaiting(buddy1, callback);
        expect(store.run).toHaveBeenCalledWith('lrem', ['buddies', 0, buddy1], jasmine.any(Function));
      });
    });

    describe('#addBuddyWaiting', function() {
      it('adds the passed buddy to the waiting buddies queue', function() {
        store.addBuddyWaiting(buddy1, callback);
        expect(store.run).toHaveBeenCalledWith('rpush', ['buddies', buddy1], jasmine.any(Function));
      });

      it('calls the passed callback with the results', function() {
        store.addBuddyWaiting(buddy1, callback);
        expect(callback).toHaveBeenCalledWith(results);
      });
    });

    describe('#setBuddies', function() {
      it('sets the first buddy with the second buddy', function() {
        store.setBuddies(buddy1, buddy2, callback);
        expect(store.run.argsForCall[0]).toEqual(['set', [Store.buddyKey(buddy1), buddy2], jasmine.any(Function)]);
      });

      it('sets the second buddy with the first buddy', function() {
        store.setBuddies(buddy1, buddy2, callback);
        expect(store.run.argsForCall[1]).toEqual(['set', [Store.buddyKey(buddy2), buddy1], jasmine.any(Function)]);
      });

      it('calls the passed callback', function() {
        store.setBuddies(buddy1, buddy2, callback);
        expect(callback).toHaveBeenCalled();
      });
    });

    describe('unsetBuddies', function() {
      it('deletes the buddy key for buddy1', function() {
        store.unsetBuddies(buddy1, buddy2, callback);
        expect(store.run.argsForCall[0]).toEqual(['del', [Store.buddyKey(buddy1)], jasmine.any(Function)]);
      });

      it('deletes the buddy key for buddy2', function() {
        store.unsetBuddies(buddy1, buddy2, callback);
        expect(store.run.argsForCall[1]).toEqual(['del', [Store.buddyKey(buddy2)], jasmine.any(Function)]);
      });

      it('calls the passed callback', function() {
        store.unsetBuddies(buddy1, buddy2, callback);
        expect(callback).toHaveBeenCalled();
      });
    });

    describe('#getAssignedBuddy', function() {
      it('gets the assigned buddy for the buddy passed', function() {
        store.getAssignedBuddy(buddy1, callback);
        expect(store.run).toHaveBeenCalledWith('get', [Store.buddyKey(buddy1)], jasmine.any(Function));
      });

      it('calls the passed callback with the results', function() {
        store.getAssignedBuddy(buddy1, callback);
        expect(callback).toHaveBeenCalledWith(results);
      });
    });

    describe('#blockBuddy', function() {
      it('increments the block value for the buddy', function() {
        store.blockBuddy(buddy1, callback);
        expect(store.run).toHaveBeenCalledWith('incr', [Store.blocksKey(buddy1)], jasmine.any(Function));
      });

      it('calls the passed callback with the results', function() {
        store.blockBuddy(buddy1, callback);
        expect(callback).toHaveBeenCalledWith(results);
      });
    });
  });
});
