Store = function(client) {
  return {
    run: function(method, params, callback) {
      var modifiedCallback = function(error, result) {
        callback(result);
      };
      params.push(modifiedCallback);
      client[method].apply(client, params);
    },

    unsetBuddiesProcess: function(person, buddy, callback) {
      var self = this;
      self.unsetBuddies(person, buddy, function() {
        self.addBuddyToPastBuddies(person, buddy, function() {
          self.removeActiveBuddies(person, buddy, function() {
            callback();
          });
        });
      });
    },

    setBuddiesProcess: function(person, buddy, callback) {
      var self = this;
      self.removeBuddyWaiting(buddy, function() {
        self.setBuddies(person, buddy, function() {
          self.addActiveBuddies(person, buddy, function() {
            callback();
          });
        });
      });
    },

    getBlocks: function(buddy, callback) {
      this.run('get', [Store.blocksKey(buddy)], callback);
    },

    getActiveBuddies: function(callback) {
      this.run('lrange', [Store.activeKey(), 0, -1], callback);
    },

    removeActiveBuddies: function(person, buddy, callback) {
      this.run('lrem', [Store.activeKey(), 0, person], function() {});
      this.run('lrem', [Store.activeKey(), 0, buddy], function() {});
      callback();
    },

    addActiveBuddies: function(person, buddy, callback) {
      this.run('lpush', [Store.activeKey(), person], function() {});
      this.run('lpush', [Store.activeKey(), buddy], function() {});
      callback();
    },

    setBlocks: function(buddy, blocks, callback) {
      this.run('set', [Store.blocksKey(buddy), blocks], callback);
    },

    blockBuddy: function(buddy, callback) {
      this.run('incr', [Store.blocksKey(buddy)], callback);
    },

    getBuddiesWaiting: function(callback) {
      this.run('lrange', [Store.queueKey(), 0, -1], callback);
    },

    removeBuddyWaiting: function(buddy, callback) {
      this.run('lrem', [Store.queueKey(), 0, buddy], callback);
    },

    addBuddyWaiting: function(buddy, callback) {
      this.run('rpush', [Store.queueKey(), buddy], callback);
    },

    getPastBuddies: function(person, callback) {
      this.run('lrange', [Store.pastBuddiesKey(person), 0 , -1], callback);
    },

    addBuddyToPastBuddies: function(person, buddy, callback) {
      this.run('rpush', [Store.pastBuddiesKey(person), buddy], function() {});
      this.run('rpush', [Store.pastBuddiesKey(buddy), person], function() {});
      callback();
    },

    setBuddies: function(buddy1, buddy2, callback) {
      this.run('set', [Store.buddyKey(buddy1), buddy2], function() {});
      this.run('set', [Store.buddyKey(buddy2), buddy1], function() {});
      callback();
    },

    unsetBuddies: function(buddy1, buddy2, callback) {
      this.run('del', [Store.buddyKey(buddy1)], function(){});
      this.run('del', [Store.buddyKey(buddy2)], function(){});
      callback();
    },

    getAssignedBuddy: function(buddy, callback) {
      this.run('get', [Store.buddyKey(buddy)], callback);
    }
  };
};

Store.buddyKey = function(number) {
  return 'person:' + number + ':buddy';
};

Store.blocksKey = function(number) {
  return 'person:' + number + ':blocks';
};

Store.pastBuddiesKey = function(number) {
  return 'person:' + number + ':buddies';
};

Store.queueKey = function() {
  return 'queue';
};

Store.activeKey = function() {
  return 'active';
};
