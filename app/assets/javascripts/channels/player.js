(function() {
  var _intoIsPlaying = false;
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
    userId: function(){
      return $('meta[name=current-user]').attr('id');
    },
    syncUserId: function(){
      return this.collection().data('sync-user-id');
    },
    isSyncUser: function(){
      return this.userId() === this.syncUserId();
    },
    updateSyncUserStar: function(){
      if(this.isSyncUser()){
        $('#isSyncUser').removeClass('hidden');
      }else{
        $('#isSyncUser').removeClass('hidden');
      }
    },
    updateSyncUserId: function(newSyncUserId){
      this.collection().data('sync-user-id', newSyncUserId);
      this.updateSyncUserStar();
    },
    introIsPlaying: function(){
      return _intoIsPlaying;
    },
    intoPlaying: function(_intoPlaying){
      introIsPlaying = _intoPlaying;
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
      if(data.intro != undefined){
        if (this.channelIsCurrentChannel(data.player)) {
          $('#intoContainer').html(data.intro);
        }
      }

      if(data.video_path != undefined){
        if (this.channelIsCurrentChannel(data.player)) {
          console.log('NEW VIDEO!');
          App.player.removePlayerEventHandlers();          
          App.player.videoPlayer().pause();
          App.player.videoPlayer().src = '';
          App.player.videoPlayer().load();

          setTimeout(function(){
            App.player.videoPlayer().src = data.video_path;
            App.player.videoPlayer().load();
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
                if(this.isSyncUser()){
                  this.playerChange({player_event: 'timeupdate', current_time: this.videoPlayer().currentTime});
                }
              }
              catch(err) {
                console.log('O NOZ!! timeupdate err:',err);
              }
              break;
            case 'reload':
              location.reload();
              break;
            case 'play':
              App.player.playVideo();
              break;
            case 'pause':
              App.player.pauseVideo();
              break;
            case 'updatesyncuser':
              console.log('updatesyncuser data.user_id:', data.user_id);
              App.player.updateSyncUserId(data.user_id);
              break;
            case 'confirmsyncuser':
              console.log('updatesyncuser data.user_id:', data.user_id);
              if(App.player.syncUserId() === data.user_id){
                this.updateSyncUserStar();
                this.playerChange({player_event: 'confirmsyncuser'});
              }
              break;
            case 'lookingfornewsyncuser':
              console.log('lookingfornewsyncuser data.user_id:', data.user_id);
              this.playerChange({player_event: 'confirmsyncuser'});
              break;
            case 'timeupdate':
              console.log('timeupdate!');
              if(!this.isSyncUser() && !isNaN(parseFloat(data.event_data.current_time))){
                console.log('timeupdate to', parseFloat(data.event_data.current_time));
                try {
                  this.videoPlayer().currentTime = parseFloat(data.event_data.current_time);
                  this.playVideo();
                }catch(err){
                  console.log('o noz! timeupdate err:',err);
                }
              }
              break;
          }
          
        }
      }

      
    },
    playVideo: function(){
      playPromise = App.player.videoPlayer().play();
      if (playPromise !== undefined) {
        playPromise.then(function() {
          // playback started!
          $('#intro').addClass('hidden');
        }).catch(function(err) {
          console.log('o noz! canot play! err:',err);
        });
      }
    },
    pauseVideo: function(){
      pausePromis = App.player.videoPlayer().pause();
      if (pausePromis !== undefined) {
        pausePromis.then(function() {
          // playback started!
        }).catch(function(err) {
          console.log('o noz! canot pause! err:',err);
        });
      }
    },
    newQ: function(){
      setTimeout(function(){
        if(!App.player.introIsPlaying() && App.player.videoPlayer().paused){
          App.player.playVideo();
          App.player.playerChange({player_event: 'wantsync'});
        }
      }, 5000);
    },
    setupPlayerEventHandlers: function(){
      console.log('setupPlayerEventHandlers!, needstime!');

      //attempt to sync time 3-times over 3 seconds
      // for (var i = 1; i < 4; i++) {
      //   setTimeout(function(){
      //     console.log('needstime!');
      //     App.player.playerChange({player_event: 'needstime'});
      //   }, i * 1000);
        
      // }
      App.player.removePlayerEventHandlers();
      if(App.player.videoPlayer() != undefined){    

        if(App.player.isSyncUser()){
          App.player.playVideo();
        }else{
          App.player.playerChange({player_event: 'needstime'});
        }

        App.player.videoPlayer().addEventListener('ended', App.player.endedEventListener);
        App.player.videoPlayer().addEventListener('click', App.player.clickEventListener);

        setTimeout(function(){
          if(App.player.videoPlayer().paused){
            App.player.playVideo();
            App.player.playerChange({player_event: 'wantsync'});
          }
        },35 * 1000);
        
      }
    },
    removePlayerEventHandlers: function(){
      console.log('removePlayerEventHandlers!');
      App.player.videoPlayer().removeEventListener('ended', App.player.endedEventListener);
      App.player.videoPlayer().removeEventListener('click', App.player.clickEventListener);
    },
    endedEventListener: function(){
      console.log('player ended!');
      try{
        if(App.player.isSyncUser()){
          App.player.playerChange({player_event: 'ended'});
        }
      }catch(err){
        //o noz!
        console.log('o noz! endedEventListener err',err);
      }finally{
        return;
      }
    },
    clickEventListener: function(){
      console.log('player onclick!');
      return App.player.videoPlayer().paused ? App.player.playVideo() : App.player.videoPlayer().pause();
    },
    playerChange: function(event_data) {
      return this.perform('player_change', {channel_id: this.channelId(), user_id: this.userId(), event_data: event_data});
    },
    channelIsCurrentChannel: function(player) {
      return $(player).attr('data-channel-id') === $('section[data-channel=qs]').attr('channel-id');
    },
    followCurrentChannel: function() {
      if (this.channelId()) {
        console.log('following PlayerChannel ',this.channelId());
        App.player.setupPlayerEventHandlers();
        return this.perform('follow', {
          channel_id: this.channelId(),
          user_id: this.userId()
        });
      } else {
        console.log('unfollowing PlayerChannel')
        return this.perform('unfollow', {
          user_id: this.userId()
        });
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
