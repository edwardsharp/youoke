import { Component, OnInit, OnDestroy } from '@angular/core';

import { AppToolbarService } from '../app-toolbar.service';
import { PlayerService } from './player.service';

@Component({
  selector: 'app-player',
  template: `
<div class="flex">
<video controls
    src=""
    poster=""
    width="">
</video>
<mat-list>
  <mat-list-item *ngFor="let item of rows">
    {{item.name}}
  </mat-list-item>
</mat-list>
</div>
`, styles: ['video{height: 100%; flex: 2}', 'mat-list{ flex: 1; max-width: 150px; max-height: 90vh; overflow: scroll;}']
})
export class PlayerComponent implements OnInit {

  rows: Array<any> = [];

  constructor(
    private appToolbarService: AppToolbarService,
    private playerService: PlayerService
  ) { }

  ngOnInit() {
  	window.setTimeout(() => {this.appToolbarService.toggleHidden(true); }, 10);
    this.playerService.getRows().then(rows => this.rows = rows);

    this.playerService.playerChange.subscribe(change => this.playerService.getRows().then(rows => this.rows = rows) );
  }
  ngOnDestroy(){
  	this.appToolbarService.toggleHidden(false);
  }
}
