import { Component, OnInit, Input } from '@angular/core';
import { PlayerService } from '../player/player.service';

@Component({
  selector: 'app-queue',
  template: `
<div id="rows">
	<div *ngFor="let item of rows" class="item">
	  {{item.name}} <button *ngIf="!hideCtrl" (click)="removeItem(item)" mat-icon-button matTooltip="Remove {{item.name}}"><mat-icon>clear</mat-icon></button>
	</div>
</div>
<div id="q-ctrl" *ngIf="!hideCtrl">
	<button mat-icon-button 
		*ngIf="rows && rows.length > 0"
		(click)="clearQ()" 
		matTooltip="Clear Queue">
			<mat-icon>delete</mat-icon>
	</button>

	<button mat-icon-button 
		matTooltip="Restart"
		(click)="restart()">
			<mat-icon>replay</mat-icon>
	</button>

	<button mat-icon-button 
		*ngIf="!currentlyPlaying || !currentlyPlaying.playing"
		matTooltip="Play"
		(click)="play()">
			<mat-icon>play_circle_outline</mat-icon>
	</button>
	<button mat-icon-button 
		*ngIf="currentlyPlaying && currentlyPlaying.playing"
		matTooltip="Pause"
		(click)="pause()">
			<mat-icon>pause_circle_outline</mat-icon>
	</button>
	<button mat-icon-button 
		matTooltip="Next"
		(click)="skip()">
			<mat-icon>skip_next</mat-icon>
	</button>

</div>
`, styles: [
	'#rows{overflow:scroll; height:calc(100vh - 64px - 40px - 100px);}',
	'.item{display:flex; justify-content:flex-end; align-items:center; border-bottom:thin solid #eaeaea; height: 50px; margin-right: 1em;}',
  '#q-ctrl{position:sticky; z-index:2; bottom:0; background-color:white; display:flex; justify-content:space-around;}'
 ]
})
export class QueueComponent implements OnInit {

	@Input() hideCtrl: string;
	rows: Array<any> = [];
	currentlyPlaying: any;

  constructor(private playerService: PlayerService) { }

  ngOnInit() {
  	this.playerService.getRows().then(rows => {
  		this.currentlyPlaying = rows[0];
  		this.rows = rows;
  	});

    this.playerService.playerChange.subscribe(change => {
    	this.playerService.getRows().then(rows => {
    		this.rows = rows
    		
    		if(!this.currentlyPlaying && rows[0]){
    			console.log("QUEUE gonna set currentlyPlaying");
    			this.currentlyPlaying = rows[0];
    		}else if(rows[0] && rows[0].id && this.currentlyPlaying.id != rows[0].id){
    			console.log("QUEUE gonna set currentlyPlaying");
    			this.currentlyPlaying = rows[0];
    		}
    	}); 
    });

    this.playerService.playerSkip.subscribe( bool => {
    	if(this.rows && this.rows[1]){
  			this.removeItem(this.rows[0]);
  		}
    });

  }

  clearQ(){
  	this.playerService.clearRows();
  }

  removeItem(item){
  	this.playerService.deleteItem(item.id);
  }

  restart(){
  	this.playerService.restart();
  }
  play(){
  	this.currentlyPlaying.playing = true;
  	this.playerService.updatePlayer(this.currentlyPlaying);
  	// this.playerService.playYtVideo();
  }
  pause(){
  	this.currentlyPlaying.playing = false;
  	this.playerService.updatePlayer(this.currentlyPlaying);
  	// this.playerService.pauseYtVideo();
  }
  skip(){
  	// this.playerService.stopYtVideo();
  	this.playerService.skip();
  }

}
