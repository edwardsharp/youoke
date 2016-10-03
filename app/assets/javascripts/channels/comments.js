(function() {
  App.comments = App.cable.subscriptions.create("CommentsChannel", {
    collection: function() {
      return $("[data-channel='comments']");
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
      if (!this.userIsCurrentUser(data.comment)) {
        return this.collection().append(data.comment);
      }
    },
    userIsCurrentUser: function(comment) {
      return $(comment).attr('data-user-id') === $('meta[name=current-user]').attr('id');
    },
    followCurrentChannel: function() {
      var channelId;
      if (channelId = this.collection().data('channel-id')) {
        return this.perform('follow', {
          channel_id: channelId
        });
      } else {
        return this.perform('unfollow');
      }
    },
    installPageChangeCallback: function() {
      if (!this.installedPageChangeCallback) {
        this.installedPageChangeCallback = true;
        return $(document).on('page:change', function() {
          return App.comments.followCurrentChannel();
        });
      }
    }
  });

}).call(this);
