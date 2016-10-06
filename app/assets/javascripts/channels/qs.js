(function() {
  App.qs = App.cable.subscriptions.create("QsChannel", {
    collection: function() {
      return $("[data-channel='qs']");
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
      console.log('qs got data:');
      // if (this.userIsCurrentUser(data.q)) {
      setTimeout(function(){
        if($('#player h1').html() == "Nothing to play yet..."){
          console.log('Nothing to play yet... needsplayerload!!');
          App.player.playerChange({player_event: 'needsplayerload'});
        }
      }, 1000);
      return this.collection().html(data.q);
      // }
    },
    // userIsCurrentUser: function(q) {
    //   return $(q).attr('data-user-id') === $('meta[name=current-user]').attr('id');
    // },
    followCurrentChannel: function() {
      var channelId;
      if (channelId = this.collection().data('channel-id')) {
        // console.log('following Qs channel!');
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
          return App.qs.followCurrentChannel();
        });
      }
    }
  });

}).call(this);
