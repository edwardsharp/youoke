(function() {
  App.search = App.cable.subscriptions.create("SearchChannel", {
    collection: function() {
      return $("[data-channel='search']");
    },
    connected: function() {
      return setTimeout((function(_this) {
        return function() {
          _this.followCurrentChannel();
          return _this.installPageChangeCallback();
        };
      })(this), 1000);
    },
    received: function(data) {
      return this.collection().html(data.search);
    },
    userIsCurrentUser: function(search) {
      return $(search).attr('data-user-id') === $('meta[name=current-user]').attr('id');
    },
    followCurrentChannel: function() {
      var userId;
      if (userId = this.collection().data('user-id')) {
        // console.log("following search channel!");
        return this.perform('follow', {
          user_id: userId
        });
      } else {
        // console.log('unfollowing search channel! this.collection():',this.collection());
        return this.perform('unfollow');
      }
    },
    installPageChangeCallback: function() {
      if (!this.installedPageChangeCallback) {
        this.installedPageChangeCallback = true;
        return $(document).on('page:change', function() {
          return App.search.followCurrentChannel();
        });
      }
    }
  });

}).call(this);
