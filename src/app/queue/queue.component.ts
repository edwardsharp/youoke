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
		matTooltip="Play">
			<mat-icon>play_circle_outline</mat-icon>
	</button>
	<button mat-icon-button 
		matTooltip="Pause">
			<mat-icon>pause_circle_outline</mat-icon>
	</button>
	<button mat-icon-button 
		matTooltip="Next">
			<mat-icon>skip_next</mat-icon>
	</button>

</div>
`, styles: [
	'#rows{overflow:scroll; height:calc(100vh - 64px - 40px - 100px);}',
	'.item{display:flex; justify-content:space-between; align-items:center; border-bottom:thin solid #eaeaea; height: 50px;}',
  '#q-ctrl{position:sticky; z-index:2; bottom:0; background-color:white; display:flex; justify-content:space-around;}'
 ]
})
export class QueueComponent implements OnInit {

	@Input() hideCtrl: string;
	rows: Array<any> = [];

  constructor(private playerService: PlayerService) { }

  ngOnInit() {
  	this.playerService.getRows().then(rows => this.rows = rows);

    this.playerService.playerChange.subscribe(change => this.playerService.getRows().then(rows => this.rows = rows) );

  }

  clearQ(){
  	this.playerService.clearRows();
  }

  removeItem(item){
  	this.playerService.deleteItem(item.id);
  }

}
