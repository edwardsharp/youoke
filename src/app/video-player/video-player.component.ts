import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { PlayerService } from '../player/player.service';

@Component({
  selector: 'app-video-player',
  template: `
<video 
  *ngIf="needsVideoPlayer"
  src=""
  poster="">
</video>
<div id="player"></div>

`, styles: [
  ':host{background-color:black; height: 100vh; overflow: hidden;}',
  'video, iframe{width:100%; height:100%; background-color:black;}'
  ]
})
export class VideoPlayerComponent implements OnInit {

  // @ViewChild('ytPlayer') ytPlayer: any;
  // @ViewChild('ytPlayer') ytPlayer: any;
 
  playerReady: boolean;
  player: any;
  donePlaying: boolean;

  needsVideoPlayer: boolean;
  needsYtPlayer: boolean;
  ytId: string;
  ytSrc: string;
  rows: Array<any> = [];

  constructor(
    private playerService: PlayerService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    

  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit!!');
    var tag = document.createElement('script');

    //<script src="https://www.youtube.com/iframe_api"></script>
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window["onYouTubeIframeAPIReady"] = () => {
      console.log("onYouTubeIframeAPIReady!");
      this.playerReady = true;

      this.playerService.getRows().then(rows => {
        this.rowsChanged(rows);
      });

      this.playerService.playerChange.subscribe(change => {
        this.playerService.getRows().then(rows => {
          this.rowsChanged(rows);
        }) 
      });

    }
    
  }

  rowsChanged(rows:Array<any>){
    this.rows = rows;
    if(rows[0] && rows[0].name){
      this.ytId = rows[0].name;
      // this.ytSrc = `https://www.youtube.com/embed/${this.ytId}?rel=0&showinfo=0`;
      //this.needsYtPlayer = true;
      //this.ytPlayer.nativeElement.src = `https://www.youtube.com/embed/${this.ytId}?rel=0&showinfo=0`;
      //this.sanitizer.bypassSecurityTrustResourceUrl();
      console.log('setting up player src:',`https://www.youtube.com/embed/${this.ytId}?rel=0&showinfo=0`);
      
      this.loadYtPlayer(rows[0].name);

      // console.log('sani fresh??',this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${this.ytId}?rel=0&showinfo=0`));
    }
  }

  loadYtPlayer(vID: string){

    this.player = new window["YT"].Player('player', {
      // enablejsapi: 1,
      // origin: window.location.origin,
      // host: 'https://www.youtube.com',
      playerVars: {
        modestbranding: 1,
        showinfo: 0,
        controls: 0,
        disablekb: 1,
        rel: 0
      },
      height: '100%',
      width: '100%',
      videoId: vID,
      events: {
        'onReady': (event) => {
          console.log('onReady! event:',event);
          event.target.playVideo();
        },
        'onStateChange': (event) => {
          console.log('onStateChange event:',event);
          if (event.data == window["YT"].PlayerState.PLAYING && !this.donePlaying) {
            setTimeout(() => {
              this.player.stopVideo();
            }, 6000);
            this.donePlaying = true;
          }
        }
      }
    });

    // 4. The API will call this function when the video player is ready.
    

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    
    
    
  }

}
