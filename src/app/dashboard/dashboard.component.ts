import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTabChangeEvent, MatSnackBar } from '@angular/material';

// import { PlaylistService } from '../playlist/playlist.service';
import { YTSearchService } from '../ytsearch.service';
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
    <div *ngIf="!ytInitialized" class="flex-col-center">
      <h2>Loading YouTube Search...</h2>
      <mat-spinner></mat-spinner>
    </div>
    <div *ngIf="ytInitialized">
    <mat-form-field appearance="outline" class="yt-search">
      <mat-label>Search YouTube</mat-label>
      <input matInput [disabled]="!searchReady" [(ngModel)]="q" (keyup.enter)="search()">
      <mat-icon matSuffix *ngIf="!q || q == ''">search</mat-icon>
      <button mat-icon-button matSuffix *ngIf="q && q != ''" (click)="clearSearch()"><mat-icon>clear</mat-icon></button>
    </mat-form-field>

    <mat-list>
      <mat-list-item *ngFor="let item of searchItems" id="{{item.id.videoId}}">
        <img matListAvatar src="{{item.snippet.thumbnails.default.url}}" alt="thumbnail">
        <h3 matLine matTooltip="{{item.snippet.title}}"> {{item.snippet.title}} </h3>
        <div matLine class="flex">
          <mat-chip-list><mat-chip>{{item.snippet.channelTitle}}</mat-chip></mat-chip-list>
          <span class="flexfill">&nbsp;</span>
          <mat-menu #playlistMenu="matMenu">
            <button mat-menu-item 
              (click)="addItemToNewPlaylist(item)">
              <mat-icon>playlist_add</mat-icon> New Playlist...
            </button>
            <button mat-menu-item *ngFor="let playlist of playlists" 
              (click)="addItemToPlaylist(item, playlist)">
              <mat-icon>playlist_add</mat-icon> {{playlist.name}}
            </button>
          </mat-menu>
          <button mat-icon-button matTooltip="Add To Playlist" [matMenuTriggerFor]="playlistMenu" (click)="openPlaylistMenu(item.id.videoId)">
            <mat-icon>playlist_add</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Add To Queue" (click)="queue(item)">
            <mat-icon>add_to_queue</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Add To Library" (click)="addToLibrary(item)">
            <mat-icon>library_add</mat-icon>
          </button>
        </div>
        
      </mat-list-item>
    </mat-list>
    <button mat-button *ngIf="nextPageToken" (click)="nextPage()" class="show-more-btn">Show More</button>

    <div id="showMoreFix" *ngIf="nextPageToken">&nbsp;</div>
    </div>
  </mat-tab>

  <mat-tab label="Settings">
    <app-settings></app-settings>
  </mat-tab>


</mat-tab-group>


`,
  styles: [
  '.flex-col-center{display:flex; flex-direction:column; align-items:center;}',
  '.yt-search{margin: 2em 5%; width: 90%;}',
  'mat-list-item:hover{background-color:#efefef; color: black!important}',
  'mat-list-item .flex{display:flex!important; justify-content:flex-end;}',
  'mat-list-item img:hover{border-radius: 0;}',
  '.show-more-btn{width: 100%}',
  '#showMoreFix{min-height:calc(100vh - 120px)}'
  ]
})
export class DashboardComponent implements OnInit {

  ytInitialized: boolean;
  searchReady: boolean;
  q: string;
  nextPageToken: string;
  searchItems: Array<any> = [];

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
          this.searchReady = ready;
          this.ytInitialized = true;
        });
      }
    }
  }

  search(){
    if(this.q && this.q != ''){
      this.nextPageToken = undefined;
      this.ytSearchService.search(this.q, this.nextPageToken, 15).then( results => {
        // console.log('search results:',results);
        this.nextPageToken = results.nextPageToken;
        this.searchItems = results.items;
      });
    }else{
      this.searchItems = [];
      this.nextPageToken = undefined;
    }
  }

  clearSearch(){
    this.q = undefined;
    this.searchItems = [];
    this.nextPageToken = undefined;
  }

  nextPage(){
    this.ytSearchService.nextPage(this.q, this.nextPageToken).then( results => {
      this.nextPageToken = results.nextPageToken;
      this.searchItems = this.searchItems.concat(results.items);
    });
  }

  getPlaylists(){
    this.playlistService.getRows().then( (playlists) => {
      this.playlists = playlists;
    });
  }

  addItemToPlaylist(item: any, playlist: Playlist){
    playlist.items = playlist.items || [];
    let _video = new Video(item.snippet.title);
    _video.value = item.id.videoId;
    playlist.items.push(_video);
    this.playlistService.updatePlaylist(playlist);
    this.playlistService.playlistSelectionChange.next(playlist.id);
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
    let _video = new Video(item.snippet.title);
    _video.value = item.id.videoId;
    this.playerService.addPlaylistItem(_video);
  }

  //hhhhhhhhack
  openPlaylistMenu(id){
    document.getElementById(id).scrollIntoView(true);
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
