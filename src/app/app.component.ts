import { Component, OnInit } from '@angular/core';

import { AppToolbarService } from './app-toolbar.service';
import { PlaylistService } from './playlist/playlist.service';
import { Playlist } from './playlist/playlist';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  toolbarHidden: boolean;

  selectedPlaylistId: number;
  playlists: Playlist[] = [];

  constructor(
    private appToolbarService: AppToolbarService,
    private playlistService: PlaylistService
  ) {
  	this.appToolbarService.toolbarHidden
			.subscribe((hidden:boolean) => {
				console.log('appToolbarService hidden:',hidden);
				this.toolbarHidden = hidden;
			});
  }

  ngOnInit(){
    this.loadPlaylists();
    this.playlistService.needsRefresh.subscribe(bool => this.loadPlaylists() );
    this.playlistService.playlistSelectionChange.subscribe(id => this.selectedPlaylistId = id );
  }

  loadPlaylists(): void {
    this.playlistService.getRows().then(p => this.playlists = p);
  }
  
  playlistSelectionChange(): void{
    // this.selectedPlaylist = this.playlists.find(p => p.id == this.selectedPlaylistId);
    this.playlistService.playlistSelectionChange.next(this.selectedPlaylistId);
  }

  addNewPlaylist(){
    this.playlistService.addNewPlaylist.next(true);
  }

}
