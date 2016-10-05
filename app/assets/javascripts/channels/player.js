(function() {
  App.player = App.cable.subscriptions.create("PlayerChannel", {
    collection: function() {
      return $("[data-channel='player']");
    },
    videoPlayer: function() {
      return document.getElementsByTagName("video")[0];
    },
    channelId: function(){
      return this.collection().data('channel-id');
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
      // console.log('player got data:',data);
      if(data.player != undefined){
        if (this.channelIsCurrentChannel(data.player)) {
          this.videoPlayer().removeAttribute("src");
          this.videoPlayer().load();
          this.collection().html(data.player);
          return this.eventHandersTimeout();
        }else{
          // console.log('channel is not current channel!');
        }
      }else if(data.player_event != undefined){
        if(this.channelId() === data.channel_id){
          switch(data.player_event){
            case 'needstime':
              this.playerChange({player_event: 'needstime', current_time: this.videoPlayer().played.end(0)});
              return;
            case 'play':
              this.videoPlayer().play();
              return;
            case 'pause':
              this.videoPlayer().pause();
              return;
            case 'timeupdate':
              if(!isNaN(parseInt(data.current_time))){
                this.videoPlayer().currentTime = parseInt(data.current_time);
              }
              return;
          }
          
        }
      }

      
    },
    eventHandersTimeout: function(){
      return setTimeout((function(_this) {
        return function() {
          return _this.setupPlayerEventHandlers();
        };
      })(this), 1000);
    },
    setupPlayerEventHandlers: function(){
      if(this.videoPlayer() == undefined){
        return;
      }
      this.videoPlayer().addEventListener('play', function(){
        // console.log('player play!');
        return App.player.playerChange({player_event: 'play'});
      });
      this.videoPlayer().addEventListener('pause', function(){
        // console.log('player pause!');
        return App.player.playerChange({player_event: 'pause'});
      });
      this.videoPlayer().addEventListener('ended', function(){
        // console.log('player ended!');
        return App.player.playerChange({player_event: 'ended'});
      });
      this.videoPlayer().addEventListener('click', function(){
        // console.log('player onclick!');
        return App.player.videoPlayer().paused ? App.player.videoPlayer().play() : App.player.videoPlayer().pause();
      });
    },
    playerChange: function(eventData) {
      return this.perform('player_change', {channel_id: this.channelId(), eventData});
    },
    channelIsCurrentChannel: function(player) {
      return $(player).attr('data-channel-id') === $('section[data-channel=qs]').attr('channel-id');
    },
    followCurrentChannel: function() {
      if (this.channelId()) {
        // console.log('following Player channel ',this.channelId());
        return this.perform('follow', {
          channel_id: this.channelId()
        });
      } else {
        return this.perform('unfollow');
      }
    },
    installPageChangeCallback: function() {
      if (!this.installedPageChangeCallback) {
        this.installedPageChangeCallback = true;
        return $(document).on('page:change', function() {
          App.player.eventHandersTimeout();
          return App.player.followCurrentChannel();
        });
      }
    }
  });

}).call(this);
