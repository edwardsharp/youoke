import { Component, OnInit, OnDestroy } from '@angular/core';

import { PlaylistService } from '../playlist/playlist.service';

@Component({
  selector: 'app-settings',
  template:`
<mat-form-field appearance="outline" class="yt-search">
  <mat-label>Search YouTube</mat-label>
  <input matInput placeholder="Enter Query...">
  <mat-icon matSuffix>search</mat-icon>
</mat-form-field>
`,
  styles: ['.yt-search{margin: 2em 5%; width: 90%;}']
})
export class DashboardComponent implements OnInit {

  constructor(private playlistService: PlaylistService){}

  ngOnInit(): void {
  }

  ngOnDestroy(): void{
  	// this.playlistService.playlistSelectionChange.next(undefined);
  }

}
