(function() {
  var playerToken = Math.random();
  var catchPauseBeforeEnd = false;
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
          App.player.removePlayerEventHandlers();
          App.player.videoPlayer().pause();
          App.player.videoPlayer().src = '';
          console.log('src???: ',this.videoPlayer().src);
          // App.player.videoPlayer().load();

          setTimeout(function(){
            App.player.collection().html(data.player);
          }, 500);
          
          setTimeout(function(){
            if(App.player.videoPlayer().dataset =! undefined && App.player.videoPlayer().dataset.intermission === 'true'){
              console.log("INTERMISSION!");
              // App.player.videoPlayer().volume = 0.5;
              // App.player.videoPlayer().play();
              App.player.removePlayerEventHandlers();
              App.player.videoPlayer().load();
              App.player.videoPlayer().addEventListener('ended', App.player.endedEventListener);
            }else{
              
              App.player.setupPlayerEventHandlers();
            }
          }, 700);

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
              this.videoPlayer().pause();
              break;
            case 'timeupdate':
              if(data.event_data.player_token == playerToken){
                console.log('player tokenz match, bail!');
                if(App.player.videoPlayer() != undefined && App.player.videoPlayer().paused){
                  App.player.videoPlayer().removeEventListener('play', App.player.playEventListener);
                  App.player.playVideo();
                  App.player.videoPlayer().addEventListener('play', App.player.playEventListener);
                }
              }else{
                console.log('timeupdate!');
                if(!isNaN(parseFloat(data.event_data.current_time))){
                  console.log('timeupdate to', parseFloat(data.event_data.current_time));
                  App.player.videoPlayer().removeEventListener('seeked', App.player.seekedEventListener);
                  App.player.videoPlayer().removeEventListener('play', App.player.seekedEventListener);
                  try {
                    this.videoPlayer().currentTime = parseFloat(data.event_data.current_time);
                    this.playVideo();
                  }catch(err){
                    console.log('o noz! timeupdate err:',err);
                  }
                  App.player.playVideo();
                  App.player.videoPlayer().addEventListener('seeked', App.player.seekedEventListener);
                  App.player.videoPlayer().addEventListener('play', App.player.seekedEventListener);
                }
              }
              break;
          }
          
        }
      }

      
    },
    playVideo: function(){
      App.player.videoPlayer().removeEventListener('play', App.player.playEventListener);
      playPromise = App.player.videoPlayer().play();
      if (playPromise !== undefined) {
        playPromise.then(function() {
          // playback started!
          App.player.videoPlayer().addEventListener('play', App.player.playEventListener);
        }).catch(function(err) {
          console.log('o noz! canot play! err:',err);
        });
      }
    },
    newQ: function(){
      if(App.player.videoPlayer() != undefined && App.player.videoPlayer().paused){
        App.player.playVideo();
      }
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

        App.player.playerChange({player_event: 'needstime'});
        
        setTimeout(function(){
          if(App.player.videoPlayer().paused){
            App.player.playVideo();
          }
        },1200);

        App.player.videoPlayer().addEventListener('play', App.player.playEventListener);
        App.player.videoPlayer().addEventListener('pause', App.player.pauseEventListener);
        App.player.videoPlayer().addEventListener('ended', App.player.endedEventListener);
        App.player.videoPlayer().addEventListener('seeked', App.player.seekedEventListener);
        App.player.videoPlayer().addEventListener('click', App.player.clickEventListener);
      }
    },
    removePlayerEventHandlers: function(){
      console.log('removePlayerEventHandlers!');
      App.player.videoPlayer().removeEventListener('play', App.player.playEventListener);
      App.player.videoPlayer().removeEventListener('pause', App.player.pauseEventListener);
      App.player.videoPlayer().removeEventListener('ended', App.player.endedEventListener);
      App.player.videoPlayer().removeEventListener('seeked', App.player.seekedEventListener);
      App.player.videoPlayer().removeEventListener('click', App.player.clickEventListener);
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
        catchPauseBeforeEnd = true;
        App.player.videoPlayer().removeEventListener('pause', App.player.pauseEventListener);
        setTimeout(function(){
          if(catchPauseBeforeEnd){
            App.player.playerChange({player_event: 'pause'});
          }
          App.player.videoPlayer().addEventListener('pause', App.player.pauseEventListener);
        }, 1000);
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
        catchPauseBeforeEnd = false;
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
      return App.player.videoPlayer().paused ? App.player.playVideo() : App.player.videoPlayer().pause();
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
