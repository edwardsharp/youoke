import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { LibraryService } from './library.service';
import { Video } from '../player/video';
import { PlaylistService } from '../playlist/playlist.service';
import { Playlist } from '../playlist/playlist';
import { PlayerService } from '../player/player.service';


@Component({
  selector: 'app-library',
  // templateUrl: './library.component.html',
  // styleUrls: ['./library.component.css'],
  template: `
<h2 *ngIf="!library?.length">Nothing in your library yet...</h2>

<mat-list *ngIf="library">
  <mat-list-item *ngFor="let video of library" id="{{video.id}}">
    <h3 matLine matTooltip="{{video.name}}"> {{video.name}} </h3>
    <div matLine class="flex">
      <span class="flexfill">&nbsp;</span>
      <button mat-icon-button matTooltip="Remove From Library" (click)="removeFromLibrary(video)">
        <mat-icon>delete</mat-icon>
      </button>
      <mat-menu #playlistMenu="matMenu">
        <button mat-menu-item 
          (click)="addVideoToNewPlaylist(video)">
          <mat-icon>playlist_add</mat-icon> New Playlist...
        </button>
        <button mat-menu-item *ngFor="let playlist of playlists" 
          (click)="addVideoToPlaylist(video, playlist)">
          <mat-icon>playlist_add</mat-icon> {{playlist.name}}
        </button>
      </mat-menu>
      <button mat-icon-button matTooltip="Add To Playlist" [matMenuTriggerFor]="playlistMenu" (click)="openPlaylistMenu(video.id)">
        <mat-icon>playlist_add</mat-icon>
      </button>
      <button mat-icon-button matTooltip="Add To Queue" (click)="queue(video)">
        <mat-icon>add_to_queue</mat-icon>
      </button>
      
    </div>
    
  </mat-list-item>
</mat-list>
  `,
  styles: [
  'mat-list{width:100%;}',
  'mat-list-item:hover{background-color:#efefef; color: black!important}',
  'mat-list-item .flex{display:flex!important; justify-content:flex-end;}',
  '#fix{min-height:calc(100vh - 120px)}'
  ]
})
export class LibraryComponent implements OnInit {

	library: Array<Video>;
	playlists: Array<Playlist>;

  constructor(
  	private libraryService: LibraryService,
  	private playlistService: PlaylistService,
		private playerService: PlayerService,
		private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  	this.getLibrary();
  	this.getPlaylists();
    this.playlistService.needsRefresh.subscribe( ok => {
      this.getPlaylists();
    });

    this.libraryService.libraryChange.subscribe( ok => {
    	console.log('library change!!');
    	this.getLibrary();
    });
  }

  getLibrary(){
    this.libraryService.getVideos().then( videos => {
      this.library = videos;
    })
  }

  getPlaylists(){
    this.playlistService.getRows().then( (playlists) => {
      this.playlists = playlists;
    });
  }

  addVideoToPlaylist(item: any, playlist: Playlist){
    playlist.items = playlist.items || [];
    let _video = new Video(item.snippet.title);
    _video.value = item.id.videoId;
    playlist.items.push(_video);
    this.playlistService.updatePlaylist(playlist);
    this.playlistService.playlistSelectionChange.next(playlist.id);
    let msg;
    if(_video.name.length > 50){
      msg = `${_video.name.substring(0, 50)}... Added to Library`;
    }else{
      msg = `${_video.name} Added to Library`;
    }
    this.snackBar.open(msg, '', {
      duration: 2000,
    }); 
  }

  addVideoToNewPlaylist(video: Video){
    let _playlist = new Playlist();
    _playlist.name = "New Playlist"
    _playlist.items = [];
    _playlist.items.push(video);
    this.playlistService.addRow(_playlist).then(id => {
      let msg;
      if(video.name.length > 50){
        msg = `${video.name.substring(0, 50)}... Added to Playlist`;
      }else{
        msg = `${video.name} Added to Playlist`;
      }
      this.snackBar.open(msg, '', {
        duration: 2000,
      }); 

      _playlist.id = id;
      this.playlistService.needsRefresh.next(true);
      window.setTimeout(() => {
        this.playlistService.playlistSelectionChange.next(id);
      }, 250);
    });

  }

  queue(video: Video){
    this.playerService.addPlaylistItem(video)
    .then( ok => {
      let msg;
      if(video.name.length > 50){
        msg = `${video.name.substring(0, 50)}... Queued`;
      }else{
        msg = `${video.name} Queued`;
      }
      this.snackBar.open(msg, '', {
        duration: 2000,
      }); 
    })
    .catch( err => {
      this.snackBar.open('Could not queue video!', '', {
        duration: 3500,
      }); 
    });
  }

  //hhhhhhhhack
  openPlaylistMenu(id){
    document.getElementById(id).scrollIntoView(true);
  }

  removeFromLibrary(video: Video){
  	this.libraryService.deleteVideo(video).then( ok => {
  		let msg;
      if(video.name.length > 50){
        msg = `${video.name.substring(0, 50)}... Removed from Library`;
      }else{
        msg = `${video.name} Removed from Library`;
      }
      this.snackBar.open(msg, '', {
        duration: 2000,
      }); 
  	});
  }


}
