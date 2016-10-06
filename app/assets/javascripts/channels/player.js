(function() {
  var playerToken = Math.random();
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
          console.log('TRYING TO DESTROY EXISTING VIDEO!');
          this.videoPlayer().removeEventListener('pause', App.player.pauseEventListener);
          this.videoPlayer().removeEventListener('play', App.player.pauseEventListener);
          this.videoPlayer().pause();
          this.videoPlayer().src = '';
          console.log('src???: ',this.videoPlayer().src);
          this.videoPlayer().load();
          setTimeout(function(){
            App.player.collection().html(data.player);
            App.player.setupPlayerEventHandlers();
          }, 500);
        }else{
          console.log('channel is not current channel!');
        }
      }else if(data.event_data.player_event != undefined){
        if(this.channelId() === data.channel_id){
          switch(data.event_data.player_event){
            case 'needstime':
              try {
                this.playerChange({player_event: 'timeupdate', current_time: this.videoPlayer().currentTime});
              }
              catch(err) {
                //o noz!
              }
              break;
            case 'play':
              this.videoPlayer().play();
              break;
            case 'pause':
              this.videoPlayer().pause();
              break;
            case 'timeupdate':
              if(data.event_data.player_token == playerToken){
                console.log('player tokenz match, bail!');
              }else{
                console.log('timeupdate!');
                if(!isNaN(parseFloat(data.event_data.current_time))){
                  console.log('timeupdate to', parseFloat(data.event_data.current_time));
                  // this.videoPlayer().removeEventListener('seeked', App.player.seekedEventListener);
                  this.videoPlayer().currentTime = parseFloat(data.event_data.current_time);
                  setTimeout(function(){
                    // App.player.videoPlayer().addEventListener('seeked', App.player.seekedEventListener);
                  }, 5000);
                  this.videoPlayer().play();
                }
              }
              break;
          }
          
        }
      }

      
    },
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

      this.videoPlayer().removeEventListener('play', App.player.playEventListener);
      this.videoPlayer().addEventListener('play', App.player.playEventListener);

      this.videoPlayer().removeEventListener('pause', App.player.pauseEventListener);
      this.videoPlayer().addEventListener('pause', App.player.pauseEventListener);
      
      this.videoPlayer().removeEventListener('ended', App.player.endedEventListener);
      this.videoPlayer().addEventListener('ended', App.player.endedEventListener);
      
      this.videoPlayer().removeEventListener('seeked', App.player.seekedEventListener);
      this.videoPlayer().addEventListener('seeked', App.player.seekedEventListener);

      this.videoPlayer().removeEventListener('click', App.player.clickEventListener);
      this.videoPlayer().addEventListener('click', App.player.clickEventListener);
    },
    seekedEventListener: function(){
      console.log('player seeked!');
      try{
        App.player.videoPlayer().removeEventListener('seeked', App.player.seekedEventListener);
        App.player.playerChange({player_event: 'timeupdate', player_token: playerToken, current_time: App.player.videoPlayer().currentTime});
        setTimeout(function(){
          App.player.videoPlayer().addEventListener('seeked', App.player.seekedEventListener);
        }, 5000);
      }catch(err){
        //o noz!
        console.log('o noz! seekedEventListener err',err);
      }finally{
        return;
      }
    },
    playEventListener: function(){
      console.log('player play!');
      try{
        App.player.videoPlayer().removeEventListener('play', App.player.playEventListener);
        App.player.playerChange({player_event: 'play'});
        setTimeout(function(){
          App.player.videoPlayer().addEventListener('play', App.player.playEventListener);
        }, 500);
      }catch(err){
        //o noz!
        console.log('o noz! playEventListener err',err);
      }finally{
        return;
      }
    },
    pauseEventListener: function(){
      console.log('player pause!');
      try{
        App.player.videoPlayer().removeEventListener('pause', App.player.pauseEventListener);
        App.player.playerChange({player_event: 'pause'});
        setTimeout(function(){
          App.player.videoPlayer().addEventListener('pause', App.player.pauseEventListener);
        }, 5000);
      }catch(err){
        //o noz!
        console.log('o noz! pauseEventListener err',err);
      }finally{
        return;
      }
    },
    endedEventListener: function(){
      console.log('player ended!');
      try{
        App.player.videoPlayer().removeEventListener('ended', App.player.endedEventListener);
        App.player.playerChange({player_event: 'ended'});
        setTimeout(function(){
          App.player.videoPlayer().addEventListener('ended', App.player.endedEventListener);
        }, 5000);
      }catch(err){
        //o noz!
        console.log('o noz! endedEventListener err',err);
      }finally{
        return;
      }
    },
    clickEventListener: function(){
      console.log('player onclick!');
      return App.player.videoPlayer().paused ? App.player.videoPlayer().play() : App.player.videoPlayer().pause();
    },
    playerChange: function(event_data) {
      return this.perform('player_change', {channel_id: this.channelId(), event_data: event_data});
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
