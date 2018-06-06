import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTabChangeEvent, MatSnackBar } from '@angular/material';

import { YTSearchService } from '../ytsearch/ytsearch.service';

import { PlaylistService } from '../playlist/playlist.service';
import { Playlist } from '../playlist/playlist';
import { PlayerService } from '../player/player.service';
import { Video } from '../player/video';
import { LibraryService } from '../library/library.service';

@Component({
  selector: 'app-dashboard',
  template:`

<mat-tab-group (selectedTabChange)="selectedTabChange($event)">
  
  <mat-tab label="Library">
    <div class="flex-col-center">
      <app-library></app-library>
    </div>
  </mat-tab>

  <mat-tab label="Search YouTube">
    <app-ytsearch 
      [showAddToPlaylist]="true"
      [showAddToLibrary]="true"
      [playlists]="playlists"
      (addItemToPlaylistEvent)="addItemToPlaylist($event)"
      (addItemToNewPlaylistEvent)="addItemToNewPlaylist($event)"
      (queueEvent)="queue($event)"
      (addToLibraryEvent)="addToLibrary($event)" ></app-ytsearch>
  </mat-tab>

  <mat-tab label="Settings">
    <app-settings></app-settings>
  </mat-tab>


</mat-tab-group>


`,
  styles: [
  '.flex-col-center{display:flex; flex-direction:column; align-items:center;}'
  ]
})
export class DashboardComponent implements OnInit {

  ytInitialized: boolean;
  playlists: Array<Playlist>;

  constructor(
    private ytSearchService: YTSearchService,
    private playlistService: PlaylistService,
    private playerService: PlayerService,
    private libraryService: LibraryService,
    private snackBar: MatSnackBar
  ){ }

  ngOnInit(): void {
    this.getPlaylists();
    this.playlistService.needsRefresh.subscribe( ok => {
      this.getPlaylists();
    });
  }

  ngOnDestroy(): void{
  	// this.playlistService.playlistSelectionChange.next(undefined);
  }

  selectedTabChange(event: MatTabChangeEvent){
    if(event && event.index == 1){
      if(!this.ytInitialized){
        this.ytSearchService.initYtSearch();
        this.ytSearchService.searchReady.subscribe( ready => {
          this.ytInitialized = true;
        });
      }
    }
  }

  getPlaylists(){
    this.playlistService.getRows().then( (playlists) => {
      this.playlists = playlists;
    });
  }

  addItemToPlaylist(event:{item: any, playlist: Playlist}){
    event.playlist.items = event.playlist.items || [];
    let _video = new Video(event.item.snippet.title);
    _video.value = event.item.id.videoId;
    event.playlist.items.push(_video);
    this.playlistService.updatePlaylist(event.playlist);
    this.libraryService.addVideo(_video);
    this.playlistService.playlistSelectionChange.next(event.playlist.id);
    let msg;
    if(_video.name.length > 50){
      msg = `${_video.name.substring(0, 50)}... Added to Playlist`;
    }else{
      msg = `${_video.name} Added to Playlist`;
    }
    this.snackBar.open(msg, '', {
      duration: 2000,
    }); 
  }

  addItemToNewPlaylist(item: any){
    let _playlist = new Playlist();
    _playlist.name = "New Playlist"
    _playlist.items = [];
    let _video = new Video(item.snippet.title);
    _video.value = item.id.videoId;
    _playlist.items.push(_video);
    this.libraryService.addVideo(_video);
    this.playlistService.addRow(_playlist).then(id => {
      let msg;
      if(_video.name.length > 50){
        msg = `${_video.name.substring(0, 50)}... Added to Playlist`;
      }else{
        msg = `${_video.name} Added to Playlist`;
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

  queue(item: any){
    this.playerService.queueItem(item)
    .then( (video:Video) => {
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

  addToLibrary(item: any){
    let _video = new Video(item.snippet.title);
    _video.value = item.id.videoId;
    this.libraryService.addVideo(_video).then( ok => {
      let msg;
      if(_video.name.length > 50){
        msg = `${_video.name.substring(0, 50)}... Added to Library`;
      }else{
        msg = `${_video.name} Added to Library`;
      }
      this.snackBar.open(msg, '', {
        duration: 2000,
      });  
    });
  }

}
