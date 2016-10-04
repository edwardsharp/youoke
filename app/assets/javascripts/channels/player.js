(function() {
  App.player = App.cable.subscriptions.create("PlayerChannel", {
    collection: function() {
      return $("[data-channel='player']");
    },
    videoPlayer: function() {
      return document.getElementsByTagName("video")[0];
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
      // console.log('player got data:',data.player);
      if (this.channelIsCurrentChannel(data.player)) {
        this.collection().html(data.player);
        return this.videoPlayer().play();
      }else{
        // console.log('channel is not current channel!');
      }
    },
    channelIsCurrentChannel: function(player) {
      return $(player).attr('data-channel-id') === $('section[data-channel=qs]').attr('channel-id');
    },
    followCurrentChannel: function() {
      var channelId;
      if (channelId = this.collection().data('channel-id')) {
        // console.log('following Player channel!');
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
          return App.player.followCurrentChannel();
        });
      }
    }
  });

}).call(this);
