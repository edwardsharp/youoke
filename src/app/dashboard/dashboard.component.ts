import { Component, OnInit, OnDestroy } from '@angular/core';

// import { PlaylistService } from '../playlist/playlist.service';
import { YTSearchService } from '../ytsearch.service';
import { PlaylistService } from '../playlist/playlist.service';
import { Playlist } from '../playlist/playlist';
import { PlayerService } from '../player/player.service';

@Component({
  selector: 'app-settings',
  template:`
<mat-form-field appearance="outline" class="yt-search">
  <mat-label>Search YouTube</mat-label>
  <input matInput placeholder="Enter Query, press enter." [disabled]="!searchReady" [(ngModel)]="q" (keyup.enter)="search()" (change)="search()">
  <mat-icon matSuffix>search</mat-icon>
</mat-form-field>

<mat-list>
  <mat-list-item *ngFor="let item of searchItems">
    <img matListAvatar src="{{item.snippet.thumbnails.default.url}}" alt="thumbnail">
    <h3 matLine matTooltip="{{item.snippet.title}}"> {{item.snippet.title}} </h3>
    <div matLine class="flex">
      <mat-chip-list><mat-chip>{{item.snippet.channelTitle}}</mat-chip></mat-chip-list>
      <span class="flexfill">&nbsp;</span>
      <mat-menu #playlistMenu="matMenu" xPosition="before" yPosition="below">
        <button mat-menu-item 
          (click)="addItemToNewPlaylist(item)">
          <mat-icon>playlist_add</mat-icon> New Playlist...
        </button>
        <button mat-menu-item *ngFor="let playlist of playlists" 
          (click)="addItemToPlaylist(item, playlist)">
          <mat-icon>playlist_add</mat-icon> {{playlist.name}}
        </button>
      </mat-menu>
      <button mat-icon-button matTooltip="Add To Playlist" [matMenuTriggerFor]="playlistMenu">
        <mat-icon>playlist_add</mat-icon>
      </button>
      <button mat-icon-button matTooltip="Add To Queue" (click)="queue(item)">
        <mat-icon>add_to_queue</mat-icon>
      </button>
    </div>
    
  </mat-list-item>

  <mat-list-item *ngIf="nextPageToken">
    <button mat-button (click)="nextPage()">Show More</button>
  </mat-list-item>
</mat-list>
`,
  styles: [
  '.yt-search{margin: 2em 5%; width: 90%;}',
  'mat-list-item:hover{background-color:#efefef}',
  'mat-list-item .flex{display:flex!important; justify-content:flex-end;}',
  'mat-list-item img:hover{border-radius: 0;}'
  ]
})
export class DashboardComponent implements OnInit {

  searchReady: boolean;
  q: string;
  nextPageToken: string;
  searchItems: Array<any> = [];

  playlists: Array<Playlist>;

  constructor(
    private ytSearchService: YTSearchService,
    private playlistService: PlaylistService,
    private playerService: PlayerService
  ){ }

  ngOnInit(): void {
    this.ytSearchService.initYtSearch();
    this.ytSearchService.searchReady.subscribe( ready => {
      console.log('search ready?',ready);
      this.searchReady = ready;
    });
    this.getPlaylists();
    this.playlistService.needsRefresh.subscribe( ok => {
      this.getPlaylists();
    });
  }

  ngOnDestroy(): void{
  	// this.playlistService.playlistSelectionChange.next(undefined);
  }

  search(){
    this.nextPageToken = undefined;
    this.ytSearchService.search(this.q, this.nextPageToken).then( results => {
      console.log('search results:',results);
      this.nextPageToken = results.nextPageToken;
      this.searchItems = results.items;
    });
  }

  nextPage(){
    this.ytSearchService.nextPage(this.q, this.nextPageToken).then( results => {
      console.log('nextPage gonna push search items:',results);
      this.nextPageToken = results.nextPageToken;
      this.searchItems = this.searchItems.concat(results.items);
    });
  }

  getPlaylists(){
    this.playlistService.getRows().then( (playlists) {
      this.playlists = playlists;
    });
  }

  addItemToPlaylist(item: any, playlist: Playlist){
    playlist.items = playlist.items || [];
    playlist.items.push({value: item.id.videoId, name: item.snippet.title});
    this.playlistService.updatePlaylist(playlist);
    this.playlistService.playlistSelectionChange.next(playlist.id);
  }

  addItemToNewPlaylist(item: any){
    let _playlist = new Playlist();
    _playlist.name = "New Playlist"
    _playlist.items = [];
    _playlist.items.push({value: item.id.videoId, name: item.snippet.title});
    this.playlistService.addRow(_playlist).then(id => {
      _playlist.id = id;
      this.playlistService.needsRefresh.next(true);
      window.setTimeout(() => {
        this.playlistService.playlistSelectionChange.next(id);
      }, 500);
    });

  }

  queue(item: any){
    this.playerService.addPlaylistItem(item.id.videoId);
  }

}
