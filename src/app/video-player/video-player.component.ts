import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { PlayerService } from '../player/player.service';
import { Video } from '../player/video';

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

  @Input() controls: boolean;

  needsVideoPlayer: boolean;
  currentlyPlaying: any;

  rows: Array<any> = [];

  constructor(
    private playerService: PlayerService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.playerService.initYtPlayer().then( ok => {
      this.playerService.loadYtPlayer(this.controls).then( player => {
        this.playerService.getRows().then(rows => {
          this.rowsChanged(rows);
        });
        this.playerService.playerChange.subscribe(change => {
          this.playerService.getRows().then(rows => {
            this.rowsChanged(rows);
          }) 
        });
      });
    });
  }

  rowsChanged(rows:Array<any>){
    this.rows = rows;
    if(rows[0] && rows[0].value){
      if(!this.currentlyPlaying){
        this.currentlyPlaying = rows[0];
        this.playerService.cueYtVideo(rows[0].value);
       }else if(this.currentlyPlaying && this.currentlyPlaying.id != rows[0].id){
        this.currentlyPlaying = rows[0];
        this.playerService.loadYtVideo(rows[0].value);
        this.currentlyPlaying.playing = true;
        this.playerService.updatePlayer(this.currentlyPlaying);
      }
    }
  }

}
