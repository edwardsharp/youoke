import { Component, OnInit, OnDestroy } from '@angular/core';

import { AppToolbarService } from '../app-toolbar.service';
import { PlayerService } from './player.service';

@Component({
  selector: 'app-player',
  template: `
<video controls
    src=""
    poster=""
    width="">
</video>
`, styles: ['video{height: 100%; width: 100%;}']
})
export class PlayerComponent implements OnInit {

  constructor(
    private appToolbarService: AppToolbarService,
    private playerService: PlayerService
  ) { }

  ngOnInit() {
  	window.setTimeout(() => {this.appToolbarService.toggleHidden(true); }, 10);
    this.playerService.playerChange.subscribe(change => console.log('player change:',change));
  }
  ngOnDestroy(){
  	this.appToolbarService.toggleHidden(false);
  }
}
