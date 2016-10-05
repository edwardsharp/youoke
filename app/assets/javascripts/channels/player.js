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
      console.log('player got data:',data);
      if(data.player != undefined){
        if (this.channelIsCurrentChannel(data.player)) {
          this.videoPlayer().removeAttribute("src");
          this.videoPlayer().load();
          this.collection().html(data.player);
          return this.setupPlayerEventHandlers();
        }else{
          console.log('channel is not current channel!');
        }
      }else if(data.event_data.player_event != undefined){
        if(this.channelId() === data.channel_id){
          switch(data.event_data.player_event){
            case 'needstime':
              try {
                this.playerChange({player_event: 'timeupdate', current_time: this.videoPlayer().played.end(0)});
              }
              catch(err) {
                //o noz!
              }
              return;
            case 'play':
              this.videoPlayer().play();
              return;
            case 'pause':
              this.videoPlayer().pause();
              return;
            case 'timeupdate':
              console.log('timeupdate!');
              if(!isNaN(parseFloat(data.event_data.current_time))){
                console.log('timeupdate to', parseFloat(data.event_data.current_time));
                this.videoPlayer().currentTime = parseFloat(data.event_data.current_time);
                this.videoPlayer().play();
              }
              return;
          }
          
        }
      }

      
    },
    // eventHandlersTimeout: function(){
    //   if(this.videoPlayer() == undefined){
    //     return;
    //   }else{
    //     return setTimeout((function(_this) {
    //       return function() {
    //         return _this.setupPlayerEventHandlers();
    //       };
    //     })(this), 1000);
    //   }
    // },
    setupPlayerEventHandlers: function(){
      console.log('setupPlayerEventHandlers!');

      //attempt to sync time 3-times over 3 seconds
      // for (var i = 1; i < 4; i++) {
      //   setTimeout(function(){
      //     console.log('needstime!');
      //     App.player.playerChange({player_event: 'needstime'});
      //   }, i * 1000);
        
      // }
      
      console.log('needstime!');
      App.player.playerChange({player_event: 'needstime'});

      this.videoPlayer().addEventListener('play', function(){
        console.log('player play!');
        return App.player.playerChange({player_event: 'play'});
      });
      this.videoPlayer().addEventListener('pause', function(){
        console.log('player pause!');
        return App.player.playerChange({player_event: 'pause'});
      });
      this.videoPlayer().addEventListener('ended', function(){
        console.log('player ended!');
        return App.player.playerChange({player_event: 'ended'});
      });
      this.videoPlayer().addEventListener('click', function(){
        console.log('player onclick!');
        return App.player.videoPlayer().paused ? App.player.videoPlayer().play() : App.player.videoPlayer().pause();
      });
    },
    playerChange: function(event_data) {
      return this.perform('player_change', {channel_id: this.channelId(), event_data});
    },
    channelIsCurrentChannel: function(player) {
      return $(player).attr('data-channel-id') === $('section[data-channel=qs]').attr('channel-id');
    },
    followCurrentChannel: function() {
      if (this.channelId()) {
        console.log('following PlayerChannel ',this.channelId());
        App.player.setupPlayerEventHandlers();
        return this.perform('follow', {
          channel_id: this.channelId()
        });
      } else {
        console.log('unfollowing PlayerChannel')
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
