import { Component, OnInit, Input } from '@angular/core';
import { PlayerService } from '../player/player.service';
import { PartylineService } from '../partyline.service';

@Component({
  selector: 'app-queue',
  template: `
<div [id]="hideCtrl ? 'playerRows' : 'rows'">
	<div *ngFor="let item of rows" class="item" class="flex">
    <div class="video">
      <span *ngIf="item && (item.title || item.name);else NoNameNoSlogan">{{item.title}} <br>
      {{item.name}} </span>
      <ng-template #NoNameNoSlogan>No Name</ng-template>
    </div>
    <button *ngIf="!hideCtrl" (click)="removeItem(item)" mat-icon-button matTooltip="Remove {{item.name}}"><mat-icon>remove_from_queue</mat-icon></button>
	</div>
</div>
<div id="q-channel" *ngIf="hideCtrl">
  <h1>{{channel}}</h1>
</div>
<div id="q-ctrl" *ngIf="!hideCtrl && currentlyPlaying && rows && rows.length > 0">
	<button mat-icon-button 
		(click)="clearQ()" 
		matTooltip="Clear Queue">
			<mat-icon>delete_sweep</mat-icon>
	</button>

	<button mat-icon-button 
		(click)="syncTime()" 
		matTooltip="Sync Time">
			<mat-icon>timer</mat-icon>
	</button>

	<mat-menu #volMenu="matMenu">
	  <mat-slider
	  	[(ngModel)]="level"
	  	(change)="volumeChange()"
		  thumbLabel
		  [displayWith]="formatLabel"
		  tickInterval="1"
		  min="1"
		  max="100"></mat-slider>
	</mat-menu>

	<button mat-icon-button 
		matTooltip="Player volume: {{level || 0}}"
		[matMenuTriggerFor]="volMenu">
	  <mat-icon>volume_mute</mat-icon>
	</button>

	<button mat-icon-button 
		*ngIf="!currentlyPlaying.playing"
		matTooltip="Play"
		(click)="play()">
			<mat-icon>play_circle_outline</mat-icon>
	</button>
	<button mat-icon-button 
		*ngIf="currentlyPlaying.playing"
		matTooltip="Pause"
		(click)="pause()">
			<mat-icon>pause_circle_outline</mat-icon>
	</button>
	<button mat-icon-button 
		matTooltip="Next"
		(click)="next()">
			<mat-icon>skip_next</mat-icon>
	</button>

</div>
`, styles: [
	'#rows{overflow:scroll; height:calc(100vh - 64px - 40px - 260px);}',
	'.item{display:flex; justify-content:flex-end; align-items:center; border-bottom:thin solid #eaeaea; height: 50px; margin-right: 1em;}',
  '#q-ctrl{position:sticky; z-index:2; bottom:0; display:flex; justify-content:space-around;}',
  '#q-channel{position:absolute; bottom:0; padding-left:15px; width:100%;}',
  'mat-slider{height: 70px; top:15px}',
  '.video{overflow:hidden; text-overflow:ellipsis; min-height:40px; max-height:54px; padding:0 5px; width:100%; display:inline-grid; align-items:center;}'
 ]
})
export class QueueComponent implements OnInit {

	@Input() hideCtrl: string;
	rows: Array<any> = [];
	currentlyPlaying: any;

  channel: string;
	private level: number;

  constructor(
    private playerService: PlayerService,
    private partylineService: PartylineService
  ) { }

  ngOnInit() {
  	this.playerService.getRows().then(rows => {
  		this.currentlyPlaying = rows[0];
  		this.rows = rows;
  	});

    this.playerService.playerChange.subscribe(change => {
    	console.log('[queue.component] playerService.playerChange! gonna getRows()');
      this.playerService.getRows().then(rows => {
    		console.log('[queue.component] playerService.playerChange got rowz:',rows);
        this.rows = rows
    		if(!this.currentlyPlaying && rows[0]){
    			this.currentlyPlaying = rows[0];
    		}else if(rows[0] && rows[0].id && this.currentlyPlaying.id != rows[0].id){
    			this.currentlyPlaying = rows[0];
    		}else if(rows[0] && rows[0].playing !== this.currentlyPlaying.playing){
    			this.currentlyPlaying.playing = rows[0].playing;
    		}
    	}); 
    });

    this.playerService.playerNext.subscribe( bool => {
    	if(this.rows && this.rows[0]){
    		if(this.currentlyPlaying.playing){
    			this.pause();
    		}
  			this.removeItem(this.rows[0]);
  		}else{
  			this.currentlyPlaying = undefined;
  			this.playerService.loadYtVideo(undefined);
  		}
    });

    this.partylineService.channelChange.subscribe( channel => this.channel = channel);
  }

  clearQ(){
    this.pause();
  	this.playerService.clearRows();
  }

  removeItem(item){
  	this.playerService.deleteItem(item.id);
  }

  play(){
  	this.currentlyPlaying.playing = true;
  	this.playerService.updatePlayer(this.currentlyPlaying);
  }
  pause(){
  	this.currentlyPlaying.playing = false;
  	this.playerService.updatePlayer(this.currentlyPlaying);
  }
  next(){
  	this.playerService.next();
  }

  volumeChange(){
  	this.setVolume(this.level);
  }

  setVolume(level: number){
  	if(this.currentlyPlaying){
  		this.currentlyPlaying.volume = level;
  		this.playerService.updatePlayer(this.currentlyPlaying);
  	}
  }

  syncTime(){
  	this.currentlyPlaying.currentTime = this.playerService.player.getCurrentTime();
  	this.playerService.updatePlayer(this.currentlyPlaying);
  }

}
