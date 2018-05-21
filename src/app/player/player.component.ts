import { Component, OnInit, OnDestroy } from '@angular/core';

import { AppToolbarService } from '../app-toolbar.service';
import { PlayerService } from './player.service';

@Component({
  selector: 'app-player',
  template: `
<div class="flex">
<app-video-player></app-video-player>
<app-queue [hideCtrl]="true"></app-queue>
</div>
`, styles: [
  'app-video-player{height: 100%; flex: 2}', 
  'app-queue{ flex: 1; max-width: 150px; max-height: 90vh; overflow: scroll;}']
})
export class PlayerComponent implements OnInit {

  constructor(
    private appToolbarService: AppToolbarService,
    private playerService: PlayerService
  ) { }

  ngOnInit() {
  	window.setTimeout(() => {this.appToolbarService.toggleHidden(true); }, 10);
  }
  ngOnDestroy(){
  	this.appToolbarService.toggleHidden(false);
  }
}
