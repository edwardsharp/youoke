import { Component, OnInit, ViewChild } from '@angular/core';
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
<iframe 
  #ytPlayer
  src=""
  frameborder="0" allowfullscreen></iframe>
  
`, styles: [
  ':host{background-color:black; height: 100vh; overflow: hidden;}',
  'video, iframe{width:100%; height:100%; background-color:black;}'
  ]
})
export class VideoPlayerComponent implements OnInit {

  @ViewChild('ytPlayer') ytPlayer: any;
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
    this.playerService.getRows().then(rows => {
      this.rowsChanged(rows);
    });

    this.playerService.playerChange.subscribe(change => {
      this.playerService.getRows().then(rows => {
        this.rowsChanged(rows);
      }) 
    });

  }

  rowsChanged(rows:Array<any>){
    this.rows = rows;
    if(rows[0] && rows[0].name){
      this.ytId = rows[0].name;
      // this.ytSrc = `https://www.youtube.com/embed/${this.ytId}?rel=0&showinfo=0`;
      this.needsYtPlayer = true;
      this.ytPlayer.nativeElement.src = `https://www.youtube.com/embed/${this.ytId}?rel=0&showinfo=0`;
      //this.sanitizer.bypassSecurityTrustResourceUrl();
      console.log('setting up player src:',`https://www.youtube.com/embed/${this.ytId}?rel=0&showinfo=0`);
      // console.log('sani fresh??',this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${this.ytId}?rel=0&showinfo=0`));
    }
  }

}
