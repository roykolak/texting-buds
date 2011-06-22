Store = function() {
  return {
    run: function(method, params, callback) {
      params.push(callback);
      client[method].apply(null, params);
    },

    getBlocks: function(buddy, callback) {
      this.run('get', [Store.blocksKey(buddy)], callback);
    },

    setBlocks: function(buddy, blocks, callback) {
      this.run('set', [Store.blocksKey(buddy), blocks], callback);
    },

    blockBuddy: function(buddy, callback) {
      this.run('incr', [Store.blocksKey(buddy)], callback);
    },

    getBuddiesWaiting: function(callback) {
      this.run('lrange', ['buddies', 0, -1], callback);
    },

    popBuddyWaiting: function(callback) {
      this.run('lpop', ['buddies'], callback);
    },

    addBuddyWaiting: function(buddy, callback) {
      this.run('rpush', ['buddies', buddy], callback);
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
  return 'phone:' + number + ':buddy';
};

Store.blocksKey = function(number) {
  return 'phone:' + number + ':blocks';
};
