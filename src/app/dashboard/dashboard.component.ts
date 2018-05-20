import { Component, OnInit, OnDestroy } from '@angular/core';

import { PlaylistService } from '../playlist/playlist.service';

@Component({
  selector: 'app-settings',
  template:`
<h1>DASHBOARD</h1>
<app-playlist></app-playlist>
`,
  styles: []
})
export class DashboardComponent implements OnInit {

  constructor(private playlistService: PlaylistService){}

  ngOnInit(): void {
  }

  ngOnDestroy(): void{
  	this.playlistService.playlistSelectionChange.next(undefined);
  }

}
